import Link from 'next/link';
import { ArrowRight, CarFront, ClipboardCheck, Inbox, LayoutGrid, Tag } from 'lucide-react';
import { adminDb } from '@/lib/db';
import { requireUser } from '@/lib/admin/auth';
import { LEAD_STATUS, LEAD_TYPES } from '@/lib/admin/entities';
import { Notice, PageHead, Panel } from '@/components/admin/ui';
import { SITE_HOST } from '@/lib/site';

export const metadata = { title: 'ภาพรวม' };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const { denied } = await searchParams;
  const db = adminDb();
  const [{ rows: [k] }, { rows: leads }] = await Promise.all([
    db.query(`select
      (select count(*) from public.leads where status = 'new')::int as new_leads,
      (select count(*) from public.leads where created_at > now() - interval '7 days')::int as week_leads,
      (select count(*) from public.launch_checklist)::int as checklist,
      (select count(*) from public.published_vehicles)::int as live_vehicles,
      (select count(*) from public.published_promotions)::int as live_promos`),
    db.query(`select l.id, l.lead_type, l.full_name, l.phone, l.status, l.created_at, v.name as vehicle, b.name as branch
               from public.leads l left join public.vehicles v on v.id = l.vehicle_id left join public.branches b on b.id = l.branch_id
              order by l.created_at desc limit 8`),
  ]);

  const tiles = [
    { href: '/admin/leads?status=new', label: 'Lead ใหม่ รอติดต่อ', value: k.new_leads, sub: `${k.week_leads} รายการใน 7 วัน`, icon: Inbox, hot: k.new_leads > 0 },
    { href: '/admin/checklist', label: 'รายการรอแก้ก่อนเปิดเว็บ', value: k.checklist, sub: 'ข้อมูลตัวอย่าง / ยังไม่มีรูป', icon: ClipboardCheck },
    { href: '/admin/c/vehicles', label: 'รุ่นรถที่แสดงบนเว็บ', value: k.live_vehicles, sub: 'เฉพาะที่เผยแพร่แล้ว', icon: CarFront },
    { href: '/admin/c/promotions', label: 'โปรโมชั่นที่กำลังแสดง', value: k.live_promos, sub: 'ไม่นับที่หมดอายุ', icon: Tag },
  ];

  return (
    <>
      <PageHead title={`สวัสดี ${user.full_name || user.email.split('@')[0]}`} desc={`ภาพรวมเว็บไซต์ ${SITE_HOST}`} />
      {denied && <Notice tone="error">หน้านั้นสำหรับผู้ดูแลระบบเท่านั้น</Notice>}

      <ul className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className={`group flex h-full flex-col rounded-[var(--radius-card)] border bg-white p-5 transition-colors hover:border-copper ${t.hot ? 'border-copper' : 'border-line'}`}>
              <span className="flex items-center justify-between text-[14px] font-semibold text-steel">
                {t.label}<t.icon size={20} className="text-copper-dark" aria-hidden />
              </span>
              <span className="mt-2 font-display text-[34px] font-bold leading-none text-navy">{t.value}</span>
              <span className="mt-2 text-[13px] text-steel">{t.sub}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Lead ล่าสุด" actions={<Link href="/admin/leads" className="text-[14px] font-semibold text-copper-dark hover:underline">ดูทั้งหมด</Link>}>
          {leads.length === 0 ? (
            <p className="text-[14px] text-steel">ยังไม่มี Lead จากเว็บ</p>
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {leads.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="font-semibold">{l.full_name} <a href={`tel:${l.phone}`} className="ml-1 font-normal text-copper-dark">{l.phone}</a></p>
                    <p className="text-[13px] text-steel">{LEAD_TYPES[l.lead_type]}{l.vehicle ? ` · ${l.vehicle}` : ''}{l.branch ? ` · ${l.branch}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded px-2 py-0.5 text-[12px] font-semibold ${l.status === 'new' ? 'bg-copper text-navy-950' : 'bg-mist text-steel'}`}>{LEAD_STATUS[l.status]}</span>
                    <p className="mt-0.5 text-[12px] text-steel">{new Date(l.created_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="ทางลัด">
          <ul className="space-y-2 text-[15px]">
            {[
              ['/admin/pages', 'เปลี่ยนแบนเนอร์ / ข้อความแต่ละหน้า', LayoutGrid],
              ['/admin/c/promotions/new', 'เพิ่มโปรโมชั่นใหม่', Tag],
              ['/admin/c/vehicles', 'แก้ราคา / รูปรุ่นรถ', CarFront],
              ['/admin/settings', 'เบอร์โทร LINE โซเชียล', Inbox],
            ].map(([href, label, I]) => {
              const Icon = I as typeof Tag;
              return (
                <li key={href as string}>
                  <Link href={href as string} className="flex items-center gap-3 rounded-md border border-line px-3.5 py-3 font-semibold hover:border-copper hover:text-copper-dark">
                    <Icon size={18} className="text-copper-dark" aria-hidden /><span className="flex-1">{label as string}</span><ArrowRight size={16} aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}
