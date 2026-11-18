import { NextResponse, type NextRequest } from 'next/server';
import { currentUser } from '@/lib/admin/auth';
import { LEAD_STATUS, LEAD_TYPES } from '@/lib/admin/entities';
import { cleanFilter, queryLeads } from '@/lib/admin/leads';

export const dynamic = 'force-dynamic';

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // กันสูตร Excel ที่ขึ้นต้นด้วย = + - @
  const safe = /^[=+\-@]/.test(s) && !/^[+-]?\d[\d\s-]*$/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/** ดาวน์โหลด Lead เป็น CSV (เปิดใน Excel ได้ ภาษาไทยไม่เพี้ยน) */
export async function GET(req: NextRequest) {
  if (!(await currentUser())) return new NextResponse('ต้องเข้าสู่ระบบ', { status: 401 });
  const f = cleanFilter(Object.fromEntries(req.nextUrl.searchParams));
  const { rows } = await queryLeads(f, 20000, 0);
  const head = ['วันที่', 'เวลา', 'ประเภท', 'สถานะ', 'ชื่อ', 'เบอร์โทร', 'อีเมล', 'รุ่นรถ', 'สาขา', 'บริการ', 'วันที่สะดวก', 'เวลาที่สะดวก', 'ข้อความ', 'บันทึก', 'มาจากหน้า', 'แคมเปญ', 'PDPA'];
  const lines = rows.map((l) => {
    const d = new Date(l.created_at);
    return [
      d.toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' }),
      d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' }),
      LEAD_TYPES[l.lead_type] ?? l.lead_type, LEAD_STATUS[l.status] ?? l.status, l.full_name, l.phone, l.email,
      l.vehicle_name, l.branch_name, l.service_type, l.preferred_date, l.preferred_time, l.message, l.note, l.source_page,
      l.utm ? Object.entries(l.utm).map(([k, v]) => `${k}=${v}`).join('; ') : '', l.consent_text_version,
    ].map(cell).join(',');
  });
  const body = '﻿' + [head.map(cell).join(','), ...lines].join('\r\n');
  const stamp = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
  return new NextResponse(body, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="ikssa-leads-${stamp}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
