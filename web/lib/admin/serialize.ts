import type { Entity } from './entities';

/** แปลงค่าจากฐานข้อมูลเป็นค่าที่ฟอร์มใช้ได้ (วันเวลาเป็นเวลาไทย) */
export function toFormValues(e: Entity, row: Record<string, unknown> | null): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!row) return out;
  for (const f of e.fields) {
    const v = row[f.name];
    if (v === null || v === undefined) { out[f.name] = null; continue; }
    if (f.type === 'datetime' && v instanceof Date) {
      // YYYY-MM-DDTHH:mm ตามเวลาไทย
      const t = new Date(v.getTime() + 7 * 3600_000).toISOString();
      out[f.name] = t.slice(0, 16);
    } else if (v instanceof Date) {
      out[f.name] = v.toISOString().slice(0, 10);
    } else out[f.name] = v;
  }
  return out;
}

export const mediaBase = () => (process.env.MEDIA_PUBLIC_URL ?? '/media').replace(/\/$/, '');
