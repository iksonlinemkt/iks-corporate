'use server';

import { headers } from 'next/headers';
import { after } from 'next/server';
import { publicDb } from '@/lib/db';
import { notifyLead } from '@/lib/leadNotify';

export type LeadState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<'full_name' | 'phone' | 'line_id' | 'email' | 'consent' | 'preferred_date', string>>;
  /** ค่าที่ผู้ใช้กรอกไว้ ส่งกลับไปเติมฟอร์มเมื่อส่งไม่ผ่าน (React ล้างฟอร์มหลังส่งทุกครั้ง) */
  values?: Record<string, string>;
};

const KEEP = ['lead_type', 'full_name', 'phone', 'line_id', 'email', 'vehicle_id', 'branch_id', 'service_type', 'preferred_date', 'preferred_time', 'message', 'consent'];
const keep = (fd: FormData) => Object.fromEntries(KEEP.map((k) => [k, typeof fd.get(k) === 'string' ? String(fd.get(k)).slice(0, 1000) : '']));

const TYPES = ['quote', 'test_drive', 'service_booking', 'contact', 'commercial', 'launch'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// กันส่งรัว: ไม่เกิน 5 ครั้ง / 10 นาที / IP (นับในหน่วยความจำของเซิร์ฟเวอร์)
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 5;
}

const str = (fd: FormData, k: string, max = 200) => {
  const v = fd.get(k);
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
};

export async function submitLead(_prev: LeadState, fd: FormData): Promise<LeadState> {
  // ช่องดักบอท: คนจริงมองไม่เห็นช่องนี้
  if (str(fd, 'website')) return { ok: true };

  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) {
    return { ok: false, values: keep(fd), message: 'ส่งข้อมูลถี่เกินไป กรุณารอสักครู่แล้วลองใหม่ หรือโทรหาเราโดยตรง' };
  }

  const leadType = (TYPES as readonly string[]).includes(str(fd, 'lead_type')) ? str(fd, 'lead_type') : 'contact';
  const fullName = str(fd, 'full_name', 100);
  // เบอร์โทร: เก็บเฉพาะตัวเลข ต้องขึ้นต้นด้วย 0 และครบ 10 หลัก (เช่น 0812345678)
  const phone = str(fd, 'phone', 30).replace(/\D/g, '');
  // LINE ID (ไม่บังคับ): ตัวอักษรอังกฤษ ตัวเลข . _ - และ @ นำหน้าได้
  const lineId = str(fd, 'line_id', 60).replace(/\s+/g, '');
  const email = str(fd, 'email', 120);
  const consent = fd.get('consent') === 'on';
  const date = str(fd, 'preferred_date', 10);

  const errors: LeadState['errors'] = {};
  if (fullName.length < 2) errors.full_name = 'กรุณากรอกชื่อ-นามสกุล';
  if (!/^0\d{9}$/.test(phone)) errors.phone = 'เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก เช่น 0812345678';
  if (lineId && !/^@?[A-Za-z0-9._-]{2,50}$/.test(lineId)) errors.line_id = 'LINE ID ใช้ได้เฉพาะตัวอักษรอังกฤษ ตัวเลข และ . _ - (มี @ นำหน้าได้)';
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.preferred_date = 'รูปแบบวันที่ไม่ถูกต้อง';
  if (!consent) errors.consent = 'กรุณาติ๊กยินยอมก่อนส่งข้อมูล';
  if (Object.keys(errors).length) return { ok: false, errors, values: keep(fd), message: 'กรุณาตรวจสอบข้อมูลที่ไฮไลต์ไว้' };

  const uuidOrNull = (k: string) => (UUID.test(str(fd, k, 36)) ? str(fd, k, 36) : null);
  const utm: Record<string, string> = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'promo']) {
    const v = str(fd, k, 100);
    if (v) utm[k] = v;
  }

  try {
    await publicDb().query(
      `insert into public.leads
        (lead_type, full_name, phone, email, branch_id, vehicle_id, service_type,
         preferred_date, preferred_time, message, consent, consent_text_version, source_page, utm, line_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        leadType, fullName, phone, email || null, uuidOrNull('branch_id'), uuidOrNull('vehicle_id'),
        str(fd, 'service_type', 60) || null, date || null, str(fd, 'preferred_time', 20) || null,
        str(fd, 'message', 1000) || null, true, str(fd, 'consent_version', 20) || null,
        str(fd, 'source_page', 200) || null, Object.keys(utm).length ? JSON.stringify(utm) : null, lineId || null,
      ],
    );
    // แจ้งเตือนเข้ากลุ่ม LINE / n8n หลังตอบลูกค้าแล้ว (ไม่ทำให้ฟอร์มช้า · ส่งไม่ได้ก็ไม่กระทบ)
    const lead = {
      lead_type: leadType, full_name: fullName, phone, line_id: lineId || null, email: email || null,
      branch_id: uuidOrNull('branch_id'), vehicle_id: uuidOrNull('vehicle_id'), service_type: str(fd, 'service_type', 60) || null,
      preferred_date: date || null, preferred_time: str(fd, 'preferred_time', 20) || null, message: str(fd, 'message', 1000) || null,
      source_page: str(fd, 'source_page', 200) || null, utm: Object.keys(utm).length ? utm : null,
    };
    after(() => notifyLead(lead).then((r) => console.log('lead notify:', r.join(' | '))).catch((e) => console.error('lead notify failed', e)));
  } catch (e) {
    console.error('lead insert failed', e);
    return { ok: false, values: keep(fd), message: 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่ หรือโทรหาเราโดยตรง' };
  }

  return {
    ok: true,
    message: leadType === 'service_booking'
      ? 'ได้รับคำขอนัดหมายแล้ว ทีมศูนย์บริการจะโทรยืนยันวันเวลากับคุณ'
      : 'ได้รับข้อมูลแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด',
  };
}
