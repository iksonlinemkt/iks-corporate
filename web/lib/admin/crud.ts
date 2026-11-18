import 'server-only';
import { randomBytes } from 'crypto';
import type { PoolClient } from 'pg';
import { adminDb } from '@/lib/db';
import { ENTITY_MAP, IMAGE_SLOTS, type Entity, type Field } from './entities';
import { saveImage, UploadError } from './media';
import type { AdminUser } from './auth';

export function getEntity(key: string): Entity {
  const e = ENTITY_MAP[key];
  if (!e) throw new Error('unknown entity');
  return e;
}

const q = (ident: string) => `"${ident.replace(/"/g, '')}"`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s: string) => UUID.test(s);

export type ListRow = {
  id: string; title: string; subtitle: string | null; image: string | null;
  status: 'sample' | 'draft' | 'published'; is_visible: boolean; sort_order: number; scope: string | null; updated_at: string;
};

export async function listRows(e: Entity, scope?: string): Promise<ListRow[]> {
  const cols = [
    'id', `${q(e.titleField)}::text as title`,
    e.subtitleField ? `${q(e.subtitleField)}::text as subtitle` : 'null as subtitle',
    e.imageField ? `${q(e.imageField)} as image` : 'null as image',
    'status', 'is_visible', 'sort_order', e.scope ? `${q(e.scope.field)}::text as scope` : 'null as scope', 'updated_at',
  ];
  const where = e.scope && scope ? `where ${q(e.scope.field)} = $1` : '';
  const { rows } = await adminDb().query(
    `select ${cols.join(', ')} from public.${q(e.table)} ${where} order by ${e.orderBy ?? 'sort_order, created_at'}`,
    e.scope && scope ? [scope] : [],
  );
  return rows;
}

export async function getRow(e: Entity, id: string) {
  if (!isUuid(id)) return null;
  const { rows } = await adminDb().query(`select * from public.${q(e.table)} where id = $1`, [id]);
  return rows[0] ?? null;
}

/** ตัวเลือกสำหรับช่องอ้างอิง (หมวดรถ, สาขา ฯลฯ) */
export async function refOptions(e: Entity) {
  const out: Record<string, { value: string; label: string }[]> = {};
  for (const f of e.fields.filter((x) => x.type === 'ref' && x.ref)) {
    const { rows } = await adminDb().query(
      `select id::text as value, ${q(f.ref!.label)}::text as label from public.${q(f.ref!.table)} order by sort_order, ${q(f.ref!.label)}`,
    );
    out[f.name] = rows;
  }
  return out;
}

// ---------------------------------------------------------------- form parsing

export type SaveResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  warnings?: string[];
  id?: string;
  /** ค่าที่ผู้ใช้กรอกไว้ ส่งกลับไปเติมฟอร์มเมื่อบันทึกไม่ผ่าน */
  values?: Record<string, string>;
};

const ECHO = new Set(['text', 'textarea', 'url', 'slug', 'number', 'select', 'icon', 'ref', 'bool', 'datetime', 'date']);
export function echoValues(e: Entity, fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of e.fields) if (ECHO.has(f.type)) out[f.name] = String(fd.get(f.name) ?? '');
  return out;
}

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === 'string' ? v.trim() : '';
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** แปลงค่าจาก <input type="datetime-local"> (เวลาไทย) เป็น timestamptz */
const bkk = (v: string) => (v ? `${v.length === 16 ? `${v}:00` : v}+07:00` : null);

async function parseFields(
  c: PoolClient, user: AdminUser, e: Entity, fd: FormData, isNew: boolean,
): Promise<{ values: Record<string, unknown>; errors: Record<string, string>; warnings: string[] }> {
  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  for (const f of e.fields) {
    if (f.createOnly && !isNew) continue;
    const raw = str(fd, f.name);
    switch (f.type) {
      case 'text': case 'textarea': case 'url':
        if (f.max && raw.length > f.max) errors[f.name] = `ยาวเกิน ${f.max} ตัวอักษร (ตอนนี้ ${raw.length})`;
        values[f.name] = raw || null;
        break;
      case 'slug': {
        const s = raw.toLowerCase();
        if (!s) {
          if (isNew) values[f.name] = `item-${randomBytes(3).toString('hex')}`;
        } else if (!/^[a-z0-9-]+$/.test(s)) {
          errors[f.name] = 'ใช้ได้เฉพาะ a-z ตัวเลข และขีด (-)';
        } else values[f.name] = s;
        break;
      }
      case 'number':
        if (!raw) values[f.name] = null;
        else if (Number.isNaN(Number(raw.replace(/,/g, '')))) errors[f.name] = 'ต้องเป็นตัวเลข';
        else values[f.name] = Number(raw.replace(/,/g, ''));
        break;
      case 'select': case 'icon':
        if (f.options && raw && !f.options.some((o) => o.value === raw) && f.type === 'select') errors[f.name] = 'ตัวเลือกไม่ถูกต้อง';
        values[f.name] = raw || null;
        break;
      case 'ref':
        values[f.name] = raw && isUuid(raw) ? raw : null;
        break;
      case 'bool':
        values[f.name] = fd.get(f.name) === 'on';
        break;
      case 'datetime':
        values[f.name] = bkk(raw);
        break;
      case 'date':
        values[f.name] = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
        break;
      case 'strings': {
        const arr = parseJson<unknown[]>(raw, []).map((x) => String(x).trim()).filter(Boolean).slice(0, 20);
        values[f.name] = JSON.stringify(arr);
        break;
      }
      case 'colors': {
        const arr = parseJson<{ name?: string; hex?: string }[]>(raw, [])
          .filter((x) => x && /^#[0-9a-f]{6}$/i.test(x.hex ?? ''))
          .map((x) => ({ name: String(x.name ?? '').trim().slice(0, 30), hex: x.hex!.toUpperCase() }))
          .slice(0, 12);
        values[f.name] = JSON.stringify(arr);
        break;
      }
      case 'specs': {
        const obj: Record<string, string> = {};
        for (const [k, v] of parseJson<[string, string][]>(raw, [])) {
          const kk = String(k ?? '').trim().slice(0, 60);
          if (kk) obj[kk] = String(v ?? '').trim().slice(0, 200);
        }
        values[f.name] = JSON.stringify(obj);
        break;
      }
      case 'image': {
        const slot = f.slot ? IMAGE_SLOTS[f.slot] : undefined;
        const file = fd.get(`file__${f.name}`);
        if (file instanceof File && file.size > 0) {
          try {
            const r = await saveImage(c, user, file, { maxWidth: slot ? slot.w * 1.25 : 2000, maxHeight: slot ? slot.h * 1.6 : 2000, nameHint: e.key });
            values[f.name] = r.path;
            if (r.warning) warnings.push(r.warning);
          } catch (err) {
            if (err instanceof UploadError) errors[f.name] = err.message;
            else throw err;
          }
        } else if (fd.get(`remove__${f.name}`) === 'on') values[f.name] = null;
        else values[f.name] = raw || null;
        break;
      }
      case 'images': {
        const slot = f.slot ? IMAGE_SLOTS[f.slot] : undefined;
        const kept = parseJson<string[]>(raw, []).filter((p) => typeof p === 'string' && /^[\w/.-]+$/.test(p));
        for (const file of fd.getAll(`file__${f.name}`)) {
          if (!(file instanceof File) || file.size === 0) continue;
          try {
            const r = await saveImage(c, user, file, { maxWidth: slot ? slot.w : 1600, maxHeight: slot ? slot.h * 1.6 : 1600, nameHint: e.key });
            kept.push(r.path);
            if (r.warning) warnings.push(r.warning);
          } catch (err) {
            if (err instanceof UploadError) errors[f.name] = err.message;
            else throw err;
          }
        }
        values[f.name] = JSON.stringify(kept.slice(0, 30));
        break;
      }
    }
    if (f.required && (values[f.name] === null || values[f.name] === '') && !errors[f.name]) errors[f.name] = 'จำเป็นต้องกรอก';
  }
  return { values, errors, warnings };
}

const JSON_TYPES = new Set(['strings', 'colors', 'specs', 'images']);
const castFor = (f: Field | undefined) => (f && JSON_TYPES.has(f.type) ? '::jsonb' : '');

export async function saveRow(c: PoolClient, user: AdminUser, e: Entity, id: string | null, fd: FormData): Promise<SaveResult> {
  const isNew = !id;
  const { values, errors, warnings } = await parseFields(c, user, e, fd, isNew);
  if (Object.keys(errors).length) {
    return { ok: false, errors, warnings, values: echoValues(e, fd), message: 'ยังบันทึกไม่ได้ กรุณาแก้ช่องที่ไฮไลต์สีแดง' };
  }

  const intent = str(fd, 'intent');
  if (intent === 'publish') values.status = 'published';
  else if (intent === 'draft') values.status = 'draft';

  const byName = Object.fromEntries(e.fields.map((f) => [f.name, f]));
  const names = Object.keys(values);

  if (isNew) {
    if (!values.status) values.status = 'draft';
    const scopeVal = e.scope ? (values[e.scope.field] ?? str(fd, e.scope.field)) : null;
    if (e.scope && scopeVal && !(e.scope.field in values)) values[e.scope.field] = scopeVal;
    const { rows: [m] } = await c.query(
      `select coalesce(max(sort_order), 0) + 10 as next from public.${q(e.table)} ${e.scope && scopeVal ? `where ${q(e.scope.field)} = $1` : ''}`,
      e.scope && scopeVal ? [scopeVal] : [],
    );
    values.sort_order = m.next;
    const cols = Object.keys(values);
    const { rows } = await c.query(
      `insert into public.${q(e.table)} (${cols.map(q).join(', ')}) values (${cols.map((k, i) => `$${i + 1}${castFor(byName[k])}`).join(', ')}) returning id`,
      cols.map((k) => values[k]),
    );
    return { ok: true, id: rows[0].id, warnings, message: 'สร้างรายการแล้ว' };
  }

  const sets = Object.keys(values).map((k, i) => `${q(k)} = $${i + 2}${castFor(byName[k])}`);
  await c.query(`update public.${q(e.table)} set ${sets.join(', ')} where id = $1`, [id, ...Object.keys(values).map((k) => values[k])]);
  void names;
  const label = values.status === 'published' ? 'บันทึกและเผยแพร่แล้ว' : values.status === 'draft' ? 'บันทึกเป็นร่างแล้ว' : 'บันทึกแล้ว';
  return { ok: true, id: id!, warnings, message: label };
}

/** เลื่อนลำดับขึ้น/ลง ภายในกลุ่มเดียวกัน แล้วจัดเลขใหม่เป็น 10, 20, 30 … */
export async function moveRow(c: PoolClient, e: Entity, id: string, dir: 'up' | 'down') {
  const { rows: [cur] } = await c.query(
    `select ${e.scope ? `${q(e.scope.field)}::text as scope` : 'null as scope'} from public.${q(e.table)} where id = $1`, [id],
  );
  if (!cur) return;
  const { rows } = await c.query(
    `select id from public.${q(e.table)} ${e.scope ? `where ${q(e.scope.field)}::text = $1` : ''} order by ${e.orderBy ?? 'sort_order, created_at'}`,
    e.scope ? [cur.scope] : [],
  );
  const ids = rows.map((r: { id: string }) => r.id);
  const i = ids.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) {
    await c.query(`update public.${q(e.table)} set sort_order = $2 where id = $1 and sort_order is distinct from $2`, [ids[k], (k + 1) * 10]);
  }
}

export { q as quoteIdent };
