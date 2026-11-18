import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'crypto';
import type { PoolClient } from 'pg';
import { adminDb } from '@/lib/db';

export const SESSION_COOKIE = 'iks_admin';
const SESSION_HOURS = 12;

export type AdminUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'marketing';
};

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

/** ผู้ใช้ที่ล็อกอินอยู่ (null ถ้าไม่ได้ล็อกอิน / session หมดอายุ / ถูกปิดบัญชี) */
export const currentUser = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length < 32) return null;
  const { rows } = await adminDb().query(
    `select u.id, u.email, u.full_name, u.role
       from public.admin_sessions s join public.admin_users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now() and u.is_active`,
    [hashToken(token)],
  );
  return (rows[0] as AdminUser) ?? null;
});

export async function requireUser(): Promise<AdminUser> {
  const u = await currentUser();
  if (!u) redirect('/admin/login');
  return u;
}

export async function requireAdmin(): Promise<AdminUser> {
  const u = await requireUser();
  if (u.role !== 'admin') redirect('/admin?denied=1');
  return u;
}

export type LoginResult = { ok: true } | { ok: false; message: string };

/** ตรวจรหัสผ่าน + กันเดารหัส: ผิด 5 ครั้งใน 15 นาที (ต่ออีเมล) หรือ 20 ครั้ง (ต่อ IP) จะถูกพักการล็อกอิน */
export async function login(emailRaw: string, password: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();
  const ip = await clientIp();
  const db = adminDb();

  const { rows: [lim] } = await db.query(
    `select
       count(*) filter (where lower(email) = $1 and not success) as by_email,
       count(*) filter (where ip = $2 and not success)           as by_ip
     from public.login_attempts
     where attempted_at > now() - interval '15 minutes'`,
    [email, ip],
  );
  if (Number(lim.by_email) >= 5 || Number(lim.by_ip) >= 20) {
    return { ok: false, message: 'ล็อกอินผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่' };
  }

  const { rows } = await db.query(
    `select id from public.admin_users
      where lower(email) = $1 and is_active and password_hash = crypt($2, password_hash)`,
    [email, password],
  );
  const ok = rows.length === 1;
  await db.query('insert into public.login_attempts (email, ip, success) values ($1, $2, $3)', [email, ip, ok]);
  if (!ok) return { ok: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };

  const token = randomBytes(32).toString('base64url');
  const h = await headers();
  await db.query(
    `insert into public.admin_sessions (token_hash, user_id, expires_at, ip, user_agent)
     values ($1, $2, now() + make_interval(hours => $3), $4, left($5, 300))`,
    [hashToken(token), rows[0].id, SESSION_HOURS, ip, h.get('user-agent') ?? ''],
  );
  await db.query('update public.admin_users set last_login_at = now() where id = $1', [rows[0].id]);
  // ล้าง session ที่หมดอายุ
  await db.query("delete from public.admin_sessions where expires_at < now() - interval '1 day'");

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
  return { ok: true };
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await adminDb().query('delete from public.admin_sessions where token_hash = $1', [hashToken(token)]);
  jar.delete(SESSION_COOKIE);
}

/** รันคำสั่งใน transaction พร้อมบอกฐานข้อมูลว่าใครเป็นคนแก้ (ใช้กับประวัติการแก้ไข) */
export async function withUser<T>(user: AdminUser, fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await adminDb().connect();
  try {
    await c.query('begin');
    await c.query("select set_config('app.user_id', $1, true)", [user.id]);
    const out = await fn(c);
    await c.query('commit');
    return out;
  } catch (e) {
    await c.query('rollback').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** แปลง error จากฐานข้อมูลเป็นข้อความภาษาไทยที่บอกวิธีแก้ */
export function dbErrorMessage(e: unknown): string {
  const err = e as { code?: string; constraint?: string; column?: string; detail?: string };
  switch (err.code) {
    case '23505':
      return 'ข้อมูลนี้ซ้ำกับที่มีอยู่แล้ว (เช่น slug หรือรหัสสาขาซ้ำ) กรุณาเปลี่ยนแล้วบันทึกใหม่';
    case '23514':
      if (err.constraint === 'staff_publish_requires_consent') return 'เผยแพร่ข้อมูลพนักงานไม่ได้ จนกว่าจะใส่วันที่ได้รับความยินยอม (PDPA)';
      if (err.constraint?.includes('slug')) return 'slug ใช้ได้เฉพาะ a-z ตัวเลข และขีด (-) เท่านั้น';
      if (err.constraint?.includes('ends_at') || err.constraint?.includes('check')) return 'ข้อมูลบางช่องไม่ถูกต้อง: ข้อความยาวเกินกำหนด หรือวันสิ้นสุดอยู่ก่อนวันเริ่ม';
      return 'ข้อมูลบางช่องไม่ถูกต้อง: ข้อความยาวเกินกำหนด หรือรูปแบบไม่ถูกต้อง';
    case '23502':
      return `กรุณากรอกช่องที่จำเป็น${err.column ? ` (${err.column})` : ''}`;
    case '23503':
      return 'รายการนี้ถูกใช้งานอยู่ที่อื่น ลบไม่ได้';
    case '22P02':
    case '22007':
    case '22008':
      return 'รูปแบบตัวเลขหรือวันที่ไม่ถูกต้อง';
    case '42501':
      return 'บัญชีของคุณไม่มีสิทธิ์ทำรายการนี้';
    default:
      console.error('admin db error', e);
      return 'บันทึกไม่สำเร็จ กรุณาลองใหม่';
  }
}
