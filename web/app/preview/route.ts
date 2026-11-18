import { NextResponse, type NextRequest } from 'next/server';
import { PREVIEW_COOKIE, tokenMatches } from '@/lib/preview';

/**
 * เปิดพรีวิว:  /preview?token=<PREVIEW_TOKEN>
 * ออกพรีวิว:   /preview?exit=1
 */
export async function GET(req: NextRequest) {
  // redirect แบบ relative เพื่อให้ทำงานถูกเมื่ออยู่หลัง Nginx
  const res = new NextResponse(null, { status: 303, headers: { Location: '/' } });
  if (req.nextUrl.searchParams.get('exit')) {
    res.cookies.delete(PREVIEW_COOKIE);
    return res;
  }
  const token = req.nextUrl.searchParams.get('token');
  if (!tokenMatches(token)) {
    return new NextResponse('ลิงก์พรีวิวไม่ถูกต้อง', { status: 401, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
  res.cookies.set(PREVIEW_COOKIE, token!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
