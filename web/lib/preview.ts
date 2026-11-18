import 'server-only';
import { cookies } from 'next/headers';
import { timingSafeEqual } from 'crypto';

export const PREVIEW_COOKIE = 'iks_preview';

export function tokenMatches(candidate: string | undefined | null): boolean {
  const expected = process.env.PREVIEW_TOKEN;
  if (!expected || expected.length < 16 || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** true เมื่อเปิดเว็บผ่าน /preview?token=... (เห็นข้อมูลตัวอย่างและร่าง) */
export async function isPreview(): Promise<boolean> {
  const jar = await cookies();
  return tokenMatches(jar.get(PREVIEW_COOKIE)?.value);
}

export function isPrelaunch(): boolean {
  return (process.env.SITE_MODE ?? 'prelaunch') !== 'live';
}

/** ทดสอบลิงก์ไลฟ์ (เฉพาะทีมงานในโหมดพรีวิว) — ลูกค้าทั่วไปไม่เห็น */
export const LIVE_TEST_COOKIE = 'iks_live_test';
export type LiveTest = { phase: 'upcoming' | 'live' | 'ended'; url: string | null };

export function parseLiveTest(raw: string | undefined | null): LiveTest | null {
  if (!raw) return null;
  const [p, ...rest] = decodeURIComponent(raw).split('|');
  if (p !== 'upcoming' && p !== 'live' && p !== 'ended') return null;
  const url = rest.join('|');
  return { phase: p, url: /^https:\/\/[^\s]{8,480}$/.test(url) ? url : null };
}

export async function getLiveTest(): Promise<LiveTest | null> {
  if (!(await isPreview())) return null;
  const jar = await cookies();
  return parseLiveTest(jar.get(LIVE_TEST_COOKIE)?.value);
}
