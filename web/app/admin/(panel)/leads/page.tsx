import Link from 'next/link';
import { BellRing, Download, Phone, Trash2 } from 'lucide-react';
import { requireUser } from '@/lib/admin/auth';
import { LEAD_STATUS, LEAD_TYPES } from '@/lib/admin/entities';
import { cleanFilter, queryLeads } from '@/lib/admin/leads';
import { PageHead, btn } from '@/components/admin/ui';
import { ConfirmButton, SubmitButton, inputCls } from '@/components/admin/FormBits';
import { deleteLeadAction, updateLeadAction } from '@/app/admin/actions';

export const metadata = { title: 'Lead' };

const PAGE = 50;
const fmt = (d: Date) => d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' });

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const f = cleanFilter(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total } = await queryLeads(f, PAGE, (page - 1) * PAGE);
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v) as [string, string][]).toString();
  const pages = Math.ceil(total / PAGE);

  return (
    <>
      <PageHead
        title="รายชื่อลูกค้า (Lead)"
        desc="ข้อมูลจากฟอร์มบนเว็บ: ขอใบเสนอราคา นัดทดลองขับ จองเข้าศูนย์ และติดต่อทั่วไป"
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }]}
        actions={<>
          <a href="/admin/lead-notify-test" className={btn.ghost}><BellRing size={16} />ทดสอบแจ้งเตือน LINE</a>
          <a href={`/admin/leads-export${qs ? `?${qs}` : ''}`} className={btn.navy}><Download size={16} />ดาวน์โหลด Excel ({total})</a>
        </>}
      />
      {sp.notify && (
        <p role="status" className={`mb-4 rounded-[var(--radius-card)] border px-4 py-3 text-[15px] ${sp.notify === 'ok' ? 'border-green-300 bg-green-50 text-green-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
          {sp.notify === 'ok' ? '✔ ส่งข้อความทดสอบแล้ว — ' : '! ' }{sp.msg}
        </p>
      )}

      <form className="mb-5 grid gap-3 rounded-[var(--radius-card)] border border-line bg-white p-4 sm:grid-cols-[1.3fr_1fr_1fr_1fr_1fr_auto]">
        <input name="q" defaultValue={f.q} placeholder="ค้นหาชื่อ / เบอร์ / อีเมล" className={inputCls} aria-label="ค้นหา" />
        <select name="status" defaultValue={f.status ?? ''} className={inputCls} aria-label="สถานะ">
          <option value="">ทุกสถานะ</option>
          {Object.entries(LEAD_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="type" defaultValue={f.type ?? ''} className={inputCls} aria-label="ประเภท">
          <option value="">ทุกประเภท</option>
          {Object.entries(LEAD_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" name="from" defaultValue={f.from} className={inputCls} aria-label="ตั้งแต่วันที่" />
        <input type="date" name="to" defaultValue={f.to} className={inputCls} aria-label="ถึงวันที่" />
        <div className="flex gap-2">
          <button className={btn.primary}>กรอง</button>
          {qs && <Link href="/admin/leads" className={btn.ghost}>ล้าง</Link>}
        </div>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-10 text-center text-steel">ไม่พบรายการตามเงื่อนไขนี้</div>
      ) : (
        <ul className="space-y-3">
          {rows.map((l) => (
            <li key={l.id} className={`rounded-[var(--radius-card)] border bg-white ${l.status === 'new' ? 'border-copper' : 'border-line'}`}>
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                  <span className={`rounded px-2 py-0.5 text-[12px] font-semibold ${l.status === 'new' ? 'bg-copper text-navy-950' : 'bg-mist text-steel'}`}>{LEAD_STATUS[l.status]}</span>
                  <span className="font-display text-[16px] font-bold">{l.full_name}</span>
                  <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1 text-[15px] font-semibold text-copper-dark"><Phone size={15} />{l.phone}</a>
                  {l.line_id && <span className="text-[14px] font-semibold text-[#06c755]">LINE: {l.line_id}</span>}
                  <span className="text-[14px] text-steel">{LEAD_TYPES[l.lead_type]}{l.vehicle_name ? ` · ${l.vehicle_name}` : ''}{l.branch_name ? ` · ${l.branch_name}` : ''}</span>
                  <span className="ml-auto text-[13px] text-steel">{fmt(l.created_at)}</span>
                </summary>
                <div className="grid gap-5 border-t border-line px-4 py-4 lg:grid-cols-[1fr_1fr]">
                  <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1.5 text-[14px]">
                    {l.line_id && <><dt className="text-steel">LINE ID</dt><dd className="font-semibold">{l.line_id}</dd></>}
                    {l.email && <><dt className="text-steel">อีเมล</dt><dd>{l.email}</dd></>}
                    {l.service_type && <><dt className="text-steel">บริการ</dt><dd>{l.service_type}</dd></>}
                    {(l.preferred_date || l.preferred_time) && <><dt className="text-steel">วันเวลาที่สะดวก</dt><dd>{l.preferred_date ?? ''} {l.preferred_time ?? ''}</dd></>}
                    {l.message && <><dt className="text-steel">ข้อความ</dt><dd className="whitespace-pre-line">{l.message}</dd></>}
                    <dt className="text-steel">มาจากหน้า</dt><dd>{l.source_page ?? '-'}</dd>
                    {l.utm && <><dt className="text-steel">แคมเปญ</dt><dd className="break-all">{Object.entries(l.utm).map(([k, v]) => `${k}: ${v}`).join(', ')}</dd></>}
                    <dt className="text-steel">ยินยอม PDPA</dt><dd>ใช่ ({l.consent_text_version ?? '-'})</dd>
                    {l.assignee_email && <><dt className="text-steel">ผู้ดูแล</dt><dd>{l.assignee || l.assignee_email}</dd></>}
                  </dl>
                  <div>
                    <form action={updateLeadAction.bind(null, l.id)} className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(LEAD_STATUS).map(([k, v]) => (
                          <label key={k} className="cursor-pointer">
                            <input type="radio" name="status" value={k} defaultChecked={l.status === k} className="peer sr-only" />
                            <span className="inline-block rounded-md border border-line px-3 py-1.5 text-[13px] font-semibold peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-copper">{v}</span>
                          </label>
                        ))}
                      </div>
                      <textarea name="note" defaultValue={l.note ?? ''} rows={2} placeholder="บันทึกการติดต่อ เช่น โทรแล้ว นัดดูรถเสาร์นี้" className={`${inputCls} resize-y`} aria-label="บันทึก" />
                      <SubmitButton className={btn.primary}>บันทึก</SubmitButton>
                    </form>
                    {user.role === 'admin' && (
                      <form action={deleteLeadAction.bind(null, l.id)} className="mt-3">
                        <ConfirmButton message={`ลบ Lead ของ ${l.full_name} ถาวร?`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-red hover:underline">
                          <Trash2 size={14} />ลบรายการนี้
                        </ConfirmButton>
                      </form>
                    )}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="หน้า" className="mt-5 flex flex-wrap items-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 4), page + 3).map((p) => (
            <Link key={p} href={`/admin/leads?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(qs)), page: String(p) })}`}
              aria-current={p === page ? 'page' : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-[14px] font-semibold ${p === page ? 'border-navy bg-navy text-white' : 'border-line bg-white'}`}>{p}</Link>
          ))}
          <span className="text-[13px] text-steel">ทั้งหมด {total} รายการ</span>
        </nav>
      )}
    </>
  );
}
