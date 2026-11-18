import 'server-only';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import sharp from 'sharp';
import type { PoolClient } from 'pg';
import type { AdminUser } from './auth';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export function mediaDir() {
  return process.env.MEDIA_DIR || path.join(process.cwd(), 'media-uploads');
}

export class UploadError extends Error {}

/**
 * ย่อรูป (ไม่เกิน maxWidth) แปลงเป็น WebP เก็บใน MEDIA_DIR/ปี/เดือน/
 * คืนค่า path แบบ relative สำหรับเก็บในฐานข้อมูล เช่น "2026/10/hero-ab12cd.webp"
 */
export async function saveImage(
  c: PoolClient, user: AdminUser, file: File, opts: { maxWidth?: number; maxHeight?: number; nameHint?: string } = {},
): Promise<{ path: string; width: number; height: number; warning?: string }> {
  if (!ACCEPT.has(file.type)) throw new UploadError(`ไฟล์ ${file.name} ไม่ใช่รูปที่รองรับ (ใช้ JPG, PNG, WebP)`);
  if (file.size > MAX_BYTES) throw new UploadError(`ไฟล์ ${file.name} ใหญ่เกิน 10 MB`);

  const input = Buffer.from(await file.arrayBuffer());
  let img = sharp(input, { failOn: 'error' }).rotate();
  let meta: Awaited<ReturnType<typeof img.metadata>>;
  try {
    meta = await img.metadata();
  } catch {
    throw new UploadError(`อ่านไฟล์ ${file.name} ไม่ได้ ไฟล์อาจเสียหรือไม่ใช่รูปจริง`);
  }
  if (!meta.width || !meta.height) throw new UploadError(`อ่านไฟล์ ${file.name} ไม่ได้`);

  const maxW = Math.round(Math.min(opts.maxWidth ?? 2400, 2400));
  const maxH = Math.round(Math.min(opts.maxHeight ?? 2400, 2400));
  img = img.resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true });
  const { data, info } = await img.webp({ quality: 82, effort: 4 }).toBuffer({ resolveWithObject: true });

  const now = new Date();
  const dir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const base = (opts.nameHint ?? path.parse(file.name).name)
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'img';
  const rel = `${dir}/${base}-${randomBytes(4).toString('hex')}.webp`;

  await mkdir(path.join(mediaDir(), dir), { recursive: true });
  await writeFile(path.join(mediaDir(), rel), data, { mode: 0o644 });

  await c.query(
    `insert into public.media_files (path, original_name, mime_type, size_bytes, width, height, uploaded_by)
     values ($1, left($2, 200), 'image/webp', $3, $4, $5, $6)`,
    [rel, file.name, data.length, info.width, info.height, user.id],
  );

  const warning = opts.maxWidth && meta.width < opts.maxWidth * 0.6
    ? `รูป ${file.name} กว้าง ${meta.width}px เล็กกว่าที่แนะนำ (${opts.maxWidth}px) อาจดูไม่คม`
    : undefined;
  return { path: rel, width: info.width, height: info.height, warning };
}
