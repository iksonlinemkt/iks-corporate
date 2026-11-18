import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/admin/auth';
import { PREVIEW_COOKIE } from '@/lib/preview';

/** ทีมงานที่ล็อกอินหลังบ้านอยู่ เปิดดูเว็บแบบพรีวิว (เห็นข้อมูลตัวอย่าง/ร่าง) ได้เลยโดยไม่ต้องใช้ลิงก์ลับ */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) {
    return new NextResponse(null, { status: 303, headers: { Location: '/admin/login' } });
  }
  const to = req.nextUrl.searchParams.get('to') ?? '/';
  const dest = /^\/(?!\/)[\w\-/]*$/.test(to) ? to : '/';
  const res = new NextResponse(null, { status: 303, headers: { Location: dest } });
  const token = process.env.PREVIEW_TOKEN;
  if (token) {
    res.cookies.set(PREVIEW_COOKIE, token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12,
    });
  }
  return res;
}
