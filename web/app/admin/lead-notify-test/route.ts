import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/admin/auth';
import { notifyLead } from '@/lib/leadNotify';

/** ปุ่มทดสอบในหน้า Lead: ส่งข้อความตัวอย่างเข้ากลุ่ม LINE / n8n */
export async function GET() {
  if (!(await currentUser())) return new NextResponse(null, { status: 303, headers: { Location: '/admin/login' } });
  const r = await notifyLead({
    lead_type: 'test_drive', full_name: 'ทดสอบ ระบบแจ้งเตือน', phone: '080-000-0000',
    preferred_date: new Date(Date.now() + 86400_000).toISOString().slice(0, 10), preferred_time: '10:00',
    message: 'ข้อความทดสอบจากหลังบ้าน — ไม่ใช่ลูกค้าจริง', source_page: '/admin/leads',
  }, { force: true });
  const ok = r.some((x) => /แล้ว$/.test(x)) && !r.some((x) => /ไม่สำเร็จ/.test(x));
  return new NextResponse(null, { status: 303, headers: { Location: `/admin/leads?notify=${ok ? 'ok' : 'fail'}&msg=${encodeURIComponent(r.join(' · '))}` } });
}
