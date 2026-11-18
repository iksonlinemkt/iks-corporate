'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { adminDb } from '@/lib/db';
import {
  dbErrorMessage, login, logout, requireAdmin, requireUser, withUser, type AdminUser,
} from '@/lib/admin/auth';
import { echoValues, getEntity, isUuid, moveRow, quoteIdent as q, saveRow, type SaveResult } from '@/lib/admin/crud';
import { saveImage, UploadError } from '@/lib/admin/media';
import { LEAD_STATUS } from '@/lib/admin/entities';
import { hasGoogleKey, searchPlaces, type PlaceCandidate } from '@/lib/google';

const refresh = () => revalidatePath('/', 'layout');
const str = (fd: FormData, k: string) => (typeof fd.get(k) === 'string' ? String(fd.get(k)).trim() : '');

// ------------------------------------------------------------------ เข้าสู่ระบบ

export async function loginAction(_: { message?: string }, fd: FormData) {
  const r = await login(str(fd, 'email'), String(fd.get('password') ?? ''));
  if (!r.ok) return { message: r.message };
  const next = str(fd, 'next');
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function logoutAction() {
  await logout();
  redirect('/admin/login');
}

// ------------------------------------------------------------------ เนื้อหา (ทุกตาราง)

export async function saveEntityAction(key: string, id: string | null, _prev: SaveResult, fd: FormData): Promise<SaveResult> {
  const user = await requireUser();
  const e = getEntity(key);
  if (id && !isUuid(id)) return { ok: false, message: 'ไม่พบรายการ' };
  if (!id && !e.canCreate) return { ok: false, message: 'สร้างรายการใหม่ในส่วนนี้ไม่ได้' };
  let r: SaveResult;
  try {
    r = await withUser(user, (c) => saveRow(c, user, e, id, fd));
  } catch (err) {
    return { ok: false, message: dbErrorMessage(err), values: echoValues(e, fd) };
  }
  refresh();
  if (r.ok && !id && r.id) redirect(`/admin/c/${key}/${r.id}?created=1`);
  return r;
}

export async function toggleVisibleAction(key: string, id: string) {
  const user = await requireUser();
  const e = getEntity(key);
  if (!isUuid(id)) return;
  await withUser(user, (c) => c.query(`update public.${q(e.table)} set is_visible = not is_visible where id = $1`, [id]));
  refresh();
}

export async function setStatusAction(key: string, id: string, status: 'published' | 'draft') {
  const user = await requireUser();
  const e = getEntity(key);
  if (!isUuid(id)) return;
  try {
    await withUser(user, (c) => c.query(`update public.${q(e.table)} set status = $2 where id = $1`, [id, status]));
  } catch (err) {
    redirect(`/admin/c/${key}/${id}?error=${encodeURIComponent(dbErrorMessage(err))}`);
  }
  refresh();
}

export async function moveAction(key: string, id: string, dir: 'up' | 'down') {
  const user = await requireUser();
  const e = getEntity(key);
  if (!isUuid(id)) return;
  await withUser(user, (c) => moveRow(c, e, id, dir));
  refresh();
}

export async function deleteEntityAction(key: string, id: string, back: string) {
  const user = await requireUser();
  const e = getEntity(key);
  if (!e.canDelete || !isUuid(id)) return;
  try {
    await withUser(user, (c) => c.query(`delete from public.${q(e.table)} where id = $1`, [id]));
  } catch (err) {
    redirect(`/admin/c/${key}/${id}?error=${encodeURIComponent(dbErrorMessage(err))}`);
  }
  refresh();
  redirect(back.startsWith('/admin') ? back : `/admin/c/${key}`);
}

/** เผยแพร่ทุกรายการในหน้ารายการ (ยกเว้นที่ยังเป็นข้อมูลตัวอย่าง) */
export async function publishAllDraftsAction(key: string, scope: string) {
  const user = await requireUser();
  const e = getEntity(key);
  const where = e.scope && scope ? `and ${q(e.scope.field)}::text = $1` : '';
  try {
    await withUser(user, (c) => c.query(`update public.${q(e.table)} set status = 'published' where status = 'draft' ${where}`, e.scope && scope ? [scope] : []));
  } catch (err) {
    redirect(`/admin/c/${key}?error=${encodeURIComponent(dbErrorMessage(err))}`);
  }
  refresh();
}

// ------------------------------------------------------------------ ตั้งค่าเว็บ / SEO

export async function saveSettingsAction(_: SaveResult, fd: FormData): Promise<SaveResult> {
  const user = await requireUser();
  try {
    await withUser(user, async (c) => {
      const { rows } = await c.query('select key from public.site_settings');
      for (const { key } of rows as { key: string }[]) {
        if (!fd.has(`s__${key}`)) continue;
        const v = str(fd, `s__${key}`).slice(0, 2000);
        await c.query(
          `update public.site_settings set value = $2, status = case when $2 = '' then 'draft'::content_status else 'published'::content_status end
           where key = $1 and (value is distinct from nullif($2, '') or status <> case when $2 = '' then 'draft'::content_status else 'published'::content_status end)`,
          [key, v],
        );
      }
    });
  } catch (err) {
    return { ok: false, message: dbErrorMessage(err) };
  }
  refresh();
  return { ok: true, message: 'บันทึกการตั้งค่าแล้ว แสดงบนเว็บทันที' };
}

export async function savePageSeoAction(slug: string, _: SaveResult, fd: FormData): Promise<SaveResult> {
  const user = await requireUser();
  const title = str(fd, 'seo_title');
  const desc = str(fd, 'seo_description');
  const errors: Record<string, string> = {};
  if (title.length > 70) errors.seo_title = `ยาวเกิน 70 ตัวอักษร (ตอนนี้ ${title.length})`;
  if (desc.length > 170) errors.seo_description = `ยาวเกิน 170 ตัวอักษร (ตอนนี้ ${desc.length})`;
  if (Object.keys(errors).length) return { ok: false, errors, values: { seo_title: title, seo_description: desc }, message: 'กรุณาแก้ช่องที่ไฮไลต์' };
  const warnings: string[] = [];
  try {
    await withUser(user, async (c) => {
      let og: string | null = str(fd, 'og_image') || null;
      const file = fd.get('file__og_image');
      if (file instanceof File && file.size > 0) {
        try {
          const r = await saveImage(c, user, file, { maxWidth: 1200, maxHeight: 630, nameHint: `og-${slug}` });
          og = r.path;
          if (r.warning) warnings.push(r.warning);
        } catch (e) {
          if (e instanceof UploadError) throw Object.assign(new Error(e.message), { userMessage: e.message });
          throw e;
        }
      } else if (fd.get('remove__og_image') === 'on') og = null;
      await c.query('update public.pages set seo_title = $2, seo_description = $3, og_image = $4 where slug = $1', [slug, title || null, desc || null, og]);
    });
  } catch (err) {
    return { ok: false, message: (err as { userMessage?: string }).userMessage ?? dbErrorMessage(err) };
  }
  refresh();
  return { ok: true, warnings, message: 'บันทึก SEO แล้ว' };
}

// ------------------------------------------------------------------ Lead

export async function updateLeadAction(id: string, fd: FormData) {
  const user = await requireUser();
  if (!isUuid(id)) return;
  const status = str(fd, 'status');
  const note = str(fd, 'note').slice(0, 2000);
  if (!(status in LEAD_STATUS)) return;
  await withUser(user, (c) => c.query(
    `update public.leads set status = $2, note = nullif($3, ''),
       assigned_to = coalesce(assigned_to, case when $2 <> 'new' then $4::uuid end)
     where id = $1`,
    [id, status, note, user.id],
  ));
  refresh();
}

export async function deleteLeadAction(id: string) {
  const user = await requireAdmin();
  if (!isUuid(id)) return;
  await withUser(user, (c) => c.query('delete from public.leads where id = $1', [id]));
  refresh();
}

// ------------------------------------------------------------------ ผู้ใช้หลังบ้าน (admin)

function checkPassword(pw: string) {
  if (pw.length < 10) return 'รหัสผ่านต้องยาวอย่างน้อย 10 ตัวอักษร';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'รหัสผ่านต้องมีทั้งตัวอักษรภาษาอังกฤษและตัวเลข';
  return null;
}

export async function createUserAction(_: SaveResult, fd: FormData): Promise<SaveResult> {
  const me = await requireAdmin();
  const email = str(fd, 'email').toLowerCase();
  const name = str(fd, 'full_name').slice(0, 100);
  const role = str(fd, 'role') === 'admin' ? 'admin' : 'marketing';
  const pw = String(fd.get('password') ?? '');
  const errors: Record<string, string> = {};
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'อีเมลไม่ถูกต้อง';
  const pwErr = checkPassword(pw);
  if (pwErr) errors.password = pwErr;
  if (Object.keys(errors).length) return { ok: false, errors, values: { email }, message: 'กรุณาแก้ช่องที่ไฮไลต์' };
  try {
    await withUser(me, (c) => c.query(
      `insert into public.admin_users (email, full_name, password_hash, role) values ($1, nullif($2, ''), crypt($3, gen_salt('bf', 12)), $4)`,
      [email, name, pw, role],
    ));
  } catch (err) {
    return { ok: false, message: (err as { code?: string }).code === '23505' ? 'มีบัญชีอีเมลนี้อยู่แล้ว' : dbErrorMessage(err) };
  }
  refresh();
  return { ok: true, message: `สร้างบัญชี ${email} แล้ว ส่งอีเมลและรหัสผ่านให้เจ้าตัว และแนะนำให้เปลี่ยนรหัสหลังล็อกอินครั้งแรก` };
}

export async function updateUserAction(id: string, fd: FormData) {
  const me = await requireAdmin();
  if (!isUuid(id)) return;
  const role = str(fd, 'role') === 'admin' ? 'admin' : 'marketing';
  const active = fd.get('is_active') === 'on';
  if (id === me.id && (role !== 'admin' || !active)) redirect('/admin/users?error=' + encodeURIComponent('ลดสิทธิ์หรือปิดบัญชีตัวเองไม่ได้'));
  await withUser(me, async (c) => {
    await c.query('update public.admin_users set role = $2, is_active = $3 where id = $1', [id, role, active]);
    if (!active) await c.query('delete from public.admin_sessions where user_id = $1', [id]);
  });
  refresh();
}

export async function resetPasswordAction(id: string, _: SaveResult, fd: FormData): Promise<SaveResult> {
  const me = await requireAdmin();
  if (!isUuid(id)) return { ok: false, message: 'ไม่พบบัญชี' };
  const pw = String(fd.get('password') ?? '');
  const err = checkPassword(pw);
  if (err) return { ok: false, message: err };
  await withUser(me, async (c) => {
    await c.query(`update public.admin_users set password_hash = crypt($2, gen_salt('bf', 12)) where id = $1`, [id, pw]);
    await c.query('delete from public.admin_sessions where user_id = $1', [id]);
  });
  return { ok: true, message: 'ตั้งรหัสผ่านใหม่แล้ว' };
}

export async function changeOwnPasswordAction(_: SaveResult, fd: FormData): Promise<SaveResult> {
  const me: AdminUser = await requireUser();
  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('password') ?? '');
  const confirm = String(fd.get('confirm') ?? '');
  if (next !== confirm) return { ok: false, errors: { confirm: 'รหัสผ่านใหม่สองช่องไม่ตรงกัน' }, message: 'กรุณาแก้ช่องที่ไฮไลต์' };
  const err = checkPassword(next);
  if (err) return { ok: false, errors: { password: err }, message: 'กรุณาแก้ช่องที่ไฮไลต์' };
  const { rows } = await adminDb().query('select 1 from public.admin_users where id = $1 and password_hash = crypt($2, password_hash)', [me.id, current]);
  if (!rows.length) return { ok: false, errors: { current: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }, message: 'กรุณาแก้ช่องที่ไฮไลต์' };
  await withUser(me, (c) => c.query(`update public.admin_users set password_hash = crypt($2, gen_salt('bf', 12)) where id = $1`, [me.id, next]));
  return { ok: true, message: 'เปลี่ยนรหัสผ่านแล้ว' };
}

// ---------------------------------------------------------------------
// ค้นหาสถานที่บน Google (ใช้ในฟอร์มสาขา)
// ---------------------------------------------------------------------
export async function searchPlacesAction(query: string): Promise<{ places?: PlaceCandidate[]; error?: string }> {
  await requireUser();
  const q = String(query ?? '').trim().slice(0, 120);
  if (q.length < 2) return { error: 'พิมพ์คำค้นหาอย่างน้อย 2 ตัวอักษร' };
  if (!hasGoogleKey()) {
    return { error: 'ยังไม่ได้ตั้งค่า Google API key บนเซิร์ฟเวอร์ — ระหว่างนี้ใส่ลิงก์ Google Maps และพิกัดเองได้ด้านล่าง' };
  }
  try {
    return { places: await searchPlaces(q) };
  } catch (e) {
    return { error: (e as Error).name === 'AbortError' ? 'Google ตอบช้าเกินไป ลองใหม่อีกครั้ง' : (e as Error).message };
  }
}

// ------------------------------------------------------------------ ควบคุมไลฟ์ (ปุ่มลัด)

/** แคมเปญที่เว็บใช้อยู่: อันบนสุดที่เผยแพร่และแสดง · ไม่มี = อันบนสุดที่เผยแพร่ */
async function activeCampaignId(): Promise<string | null> {
  const { rows } = await adminDb().query(
    "select id from public.campaigns where status = 'published' order by is_visible desc, sort_order, created_at limit 1");
  return rows[0]?.id ?? null;
}

export async function liveControlAction(fd: FormData) {
  const user = await requireUser();
  const act = str(fd, 'act');
  const url = str(fd, 'live_url');
  const id = await activeCampaignId();
  if (!id) redirect('/admin/live-test?err=nocampaign');
  if (url && !/^https:\/\/[^\s]{8,480}$/.test(url)) redirect('/admin/live-test?err=url');

  const MODE: Record<string, string> = { start: 'live', end: 'ended', upcoming: 'upcoming', auto: 'auto' };
  await withUser(user, async (c) => {
    if (url) await c.query('update public.campaigns set live_url = $2 where id = $1', [id, url]);
    if (act === 'start') {
      const { rows } = await c.query('select live_url from public.campaigns where id = $1', [id]);
      if (!rows[0]?.live_url) return;
    }
    if (MODE[act]) await c.query('update public.campaigns set mode = $2 where id = $1', [id, MODE[act]]);
    // เริ่มไลฟ์ / กดแสดง: ให้แคมเปญขึ้นเว็บพร้อมเมนูแน่นอน
    if (act === 'start' || act === 'show') {
      await c.query('update public.campaigns set is_visible = true, show_in_nav = true, show_on_home = true where id = $1', [id]);
    }
  });
  refresh();
  if (act === 'start' && !url) {
    const { rows } = await adminDb().query('select live_url from public.campaigns where id = $1', [id]);
    if (!rows[0]?.live_url) redirect('/admin/live-test?err=nourl');
  }
  redirect(`/admin/live-test?done=${encodeURIComponent(act || 'save')}`);
}
