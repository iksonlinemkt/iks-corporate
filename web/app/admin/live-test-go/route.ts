import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/admin/auth';
import { LIVE_TEST_COOKIE, PREVIEW_COOKIE } from '@/lib/preview';

/**
 * เริ่ม/หยุด ทดสอบลิงก์ไลฟ์ ให้เห็นเฉพาะทีมงานที่ล็อกอินหลังบ้าน (ผ่านโหมดพรีวิว)
 * ?url=<ลิงก์>&phase=live|upcoming|ended&to=live|home   ·   ?stop=1 = หยุดทดสอบ
 */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) {
    return new NextResponse(null, { status: 303, headers: { Location: '/admin/login' } });
  }
  const sp = req.nextUrl.searchParams;
  const secure = process.env.NODE_ENV === 'production';

  if (sp.get('stop')) {
    const res = new NextResponse(null, { status: 303, headers: { Location: '/admin/live-test?stopped=1' } });
    res.cookies.set(LIVE_TEST_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  }

  const url = (sp.get('url') ?? '').trim();
  const phaseRaw = sp.get('phase');
  const phase = phaseRaw === 'upcoming' || phaseRaw === 'ended' ? phaseRaw : 'live';
  if (url && !/^https:\/\/[^\s]{8,480}$/.test(url)) {
    return new NextResponse(null, { status: 303, headers: { Location: '/admin/live-test?error=url' } });
  }
  const dest = sp.get('to') === 'home' ? '/' : '/live';
  const res = new NextResponse(null, { status: 303, headers: { Location: dest } });
  const token = process.env.PREVIEW_TOKEN;
  if (token) res.cookies.set(PREVIEW_COOKIE, token, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
  res.cookies.set(LIVE_TEST_COOKIE, encodeURIComponent(`${phase}|${url}`), { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 30 });
  return res;
}
