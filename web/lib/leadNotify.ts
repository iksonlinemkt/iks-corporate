import 'server-only';
import { publicDb } from './db';
import { SITE_URL } from './site';

/**
 * แจ้งเตือนลูกค้าใหม่ (Lead) เข้ากลุ่ม LINE และ/หรือ n8n
 * - LINE: ใส่ LINE_CHANNEL_TOKEN (ไฟล์ /root/iks-web/line_channel_token) + รหัสกลุ่มในหลังบ้าน (line_group_default / line_group_bn …)
 * - n8n: ใส่ LEAD_WEBHOOK_URL (ไฟล์ /root/iks-web/lead_webhook_url) — ส่ง JSON ไปให้ n8n จัดการต่อ
 * ส่งไม่สำเร็จไม่กระทบการบันทึก Lead (ข้อมูลยังอยู่ในหลังบ้านเสมอ)
 */
export const LEAD_LABEL: Record<string, string> = {
  quote: 'ขอใบเสนอราคา', test_drive: 'นัดทดลองขับ', service_booking: 'นัดเข้าศูนย์', contact: 'สอบถามทั่วไป', commercial: 'รถพาณิชย์', launch: 'ลงทะเบียนรุ่นใหม่',
};
const ICON: Record<string, string> = { quote: '📄', test_drive: '🚗', service_booking: '🔧', contact: '💬', commercial: '🚚', launch: '✨' };

export type LeadInput = {
  lead_type: string; full_name: string; phone: string; email?: string | null;
  branch_id?: string | null; vehicle_id?: string | null; service_type?: string | null;
  preferred_date?: string | null; preferred_time?: string | null; message?: string | null;
  source_page?: string | null; utm?: Record<string, string> | null;
};

const thDate = (d: string) => {
  const [y, m, day] = d.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', weekday: 'short', timeZone: 'UTC' });
};

async function lookup(lead: LeadInput) {
  const db = publicDb();
  const keys = ['line_group_default', 'lead_notify_types', 'company_name_th'];
  const [settings, branch, vehicle] = await Promise.all([
    db.query("select key, value from public.published_site_settings where key like 'line_group_%' or key = any($1)", [keys]).then((r) => r.rows as { key: string; value: string | null }[]),
    lead.branch_id ? db.query('select code, name from public.published_branches where id = $1', [lead.branch_id]).then((r) => r.rows[0] as { code: string; name: string } | undefined) : undefined,
    lead.vehicle_id ? db.query('select name from public.published_vehicles where id = $1', [lead.vehicle_id]).then((r) => r.rows[0] as { name: string } | undefined) : undefined,
  ]);
  const s = Object.fromEntries(settings.filter((r) => r.value).map((r) => [r.key, r.value!.trim()]));
  return { s, branch, vehicle };
}

export function leadText(lead: LeadInput, branchName?: string, vehicleName?: string) {
  const when = [lead.preferred_date && thDate(lead.preferred_date), lead.preferred_time].filter(Boolean).join(' ');
  return [
    `${ICON[lead.lead_type] ?? '📩'} ลูกค้าใหม่ · ${LEAD_LABEL[lead.lead_type] ?? lead.lead_type}`,
    `ชื่อ: ${lead.full_name}`,
    `โทร: ${lead.phone}`,
    lead.email && `อีเมล: ${lead.email}`,
    vehicleName && `รุ่น: ${vehicleName}`,
    lead.service_type && `บริการ: ${lead.service_type}`,
    branchName && `สาขา: ${branchName}`,
    when && `วันที่สะดวก: ${when}`,
    lead.message && `ข้อความ: ${lead.message.slice(0, 500)}`,
    lead.source_page && `จากหน้า: ${lead.source_page}`,
    lead.utm?.utm_source && `แหล่งที่มา: ${[lead.utm.utm_source, lead.utm.utm_campaign].filter(Boolean).join(' / ')}`,
    `\nดูทั้งหมด: ${SITE_URL}/admin/leads`,
  ].filter((x): x is string => typeof x === 'string' && x.length > 0).join('\n');
}

async function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
}

export async function pushLine(to: string, text: string) {
  const token = process.env.LINE_CHANNEL_TOKEN;
  if (!token) throw new Error('ยังไม่ได้ตั้ง LINE_CHANNEL_TOKEN');
  await post('https://api.line.me/v2/bot/message/push', { to, messages: [{ type: 'text', text: text.slice(0, 4900) }] }, { Authorization: `Bearer ${token}` });
}

/** ส่งแจ้งเตือน คืนรายการผล (ใช้แสดงในปุ่มทดสอบหลังบ้าน) */
export async function notifyLead(lead: LeadInput, opts: { force?: boolean } = {}): Promise<string[]> {
  const out: string[] = [];
  const { s, branch, vehicle } = await lookup(lead);
  const types = (s.lead_notify_types ?? 'test_drive,quote,commercial,launch,contact').split(/[,\s]+/).filter(Boolean);
  if (!opts.force && !types.includes(lead.lead_type)) return ['ไม่แจ้งเตือนประเภทนี้ (ตั้งค่าที่ lead_notify_types)'];
  const text = leadText(lead, branch?.name, vehicle?.name);

  // LINE: กลุ่มของสาขาที่ลูกค้าเลือก → ไม่มีให้ใช้กลุ่มรวม
  const group = (branch && s[`line_group_${branch.code.toLowerCase()}`]) || s.line_group_default;
  if (process.env.LINE_CHANNEL_TOKEN || group) {
    if (!group) out.push('LINE: ยังไม่ได้ใส่รหัสกลุ่ม (line_group_default)');
    else if (!process.env.LINE_CHANNEL_TOKEN) out.push('LINE: ยังไม่ได้ตั้ง token (bash /root/ikssa_lead_notify.sh --line-token …)');
    else {
      try { await pushLine(group, text); out.push(`LINE: ส่งเข้ากลุ่ม ${group.slice(0, 8)}… แล้ว`); } catch (e) { out.push(`LINE: ส่งไม่สำเร็จ — ${(e as Error).message}`); }
    }
  }

  // n8n / ระบบอื่น
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      await post(hook, {
        event: 'lead.created', lead_type: lead.lead_type, lead_label: LEAD_LABEL[lead.lead_type] ?? lead.lead_type,
        full_name: lead.full_name, phone: lead.phone, email: lead.email ?? null,
        vehicle: vehicle?.name ?? null, branch_code: branch?.code ?? null, branch_name: branch?.name ?? null,
        line_group: group ?? null, service_type: lead.service_type ?? null,
        preferred_date: lead.preferred_date ?? null, preferred_time: lead.preferred_time ?? null,
        message: lead.message ?? null, source_page: lead.source_page ?? null, utm: lead.utm ?? null,
        created_at: new Date().toISOString(), admin_url: `${SITE_URL}/admin/leads`, text,
      });
      out.push('n8n: ส่งแล้ว');
    } catch (e) { out.push(`n8n: ส่งไม่สำเร็จ — ${(e as Error).message}`); }
  }
  if (!out.length) out.push('ยังไม่ได้ตั้งค่าการแจ้งเตือน (LINE หรือ n8n)');
  return out;
}
