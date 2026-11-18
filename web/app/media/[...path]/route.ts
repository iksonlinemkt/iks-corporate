import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse, type NextRequest } from 'next/server';
import { mediaDir } from '@/lib/admin/media';

/**
 * สำรอง: ส่งไฟล์รูปจาก MEDIA_DIR (บน VPS ปกติ Nginx ส่งไฟล์ /media/ เองโดยไม่ผ่านตรงนี้)
 */
const TYPES: Record<string, string> = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm' };

export async function GET(_: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  if (parts.some((p) => !/^[\w.-]+$/.test(p) || p.startsWith('.'))) return new NextResponse('not found', { status: 404 });
  const root = path.resolve(mediaDir());
  const file = path.resolve(root, ...parts);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!file.startsWith(root + path.sep) || !type) return new NextResponse('not found', { status: 404 });
  try {
    const data = await readFile(file);
    return new NextResponse(new Uint8Array(data), { headers: { 'content-type': type, 'cache-control': 'public, max-age=2592000', 'x-content-type-options': 'nosniff' } });
  } catch {
    return new NextResponse('not found', { status: 404 });
  }
}
