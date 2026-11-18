import Link from 'next/link';
import { CircleCheck, Pencil } from 'lucide-react';
import { adminDb } from '@/lib/db';
import { ENTITY_BY_TABLE, HIGHLIGHT_GROUPS, PAGES } from '@/lib/admin/entities';
import { PageHead } from '@/components/admin/ui';

export const metadata = { title: 'เช็กก่อนเปิดเว็บ' };

const AREA_LABEL: Record<string, string> = Object.fromEntries([...PAGES, ...HIGHLIGHT_GROUPS].map((o) => [o.value, o.label]));

function editHref(table: string, id: string) {
  if (table === 'site_settings') return '/admin/settings';
  const e = ENTITY_BY_TABLE[table];
  return e ? `/admin/c/${e.key}/${id}?back=/admin/checklist` : '/admin';
}

export default async function ChecklistPage() {
  const { rows } = await adminDb().query('select * from public.launch_checklist');
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const label = ENTITY_BY_TABLE[r.table_name]?.label ?? (r.table_name === 'site_settings' ? 'ตั้งค่าเว็บ' : r.table_name);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(r);
  }
  return (
    <>
      <PageHead
        title="เช็กก่อนเปิดเว็บ"
        desc="รายการที่ยังเป็นข้อมูลตัวอย่าง ยังไม่ได้กรอก หรือยังไม่มีรูป ต้องเหลือ 0 ก่อนเปิดเว็บจริง (รายการที่ไม่ใช้ กดเข้าไปแล้ว &quot;ซ่อน&quot; หรือลบได้)"
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }]}
      />
      {rows.length === 0 ? (
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-emerald-600/25 bg-emerald-50 p-6 text-emerald-800">
          <CircleCheck size={28} /><p className="text-[16px] font-semibold">เรียบร้อยครบทุกรายการ พร้อมเปิดเว็บ</p>
        </div>
      ) : (
        <>
          <p className="mb-4 font-display text-[18px] font-bold">เหลือ <span className="text-copper-dark">{rows.length}</span> รายการ</p>
          <div className="grid gap-5 lg:grid-cols-2">
            {[...groups.entries()].map(([label, items]) => (
              <section key={label} className="rounded-[var(--radius-card)] border border-line bg-white">
                <h2 className="flex items-center justify-between border-b border-line px-5 py-3 text-[16px] font-bold">
                  {label}<span className="rounded-full bg-mist px-2.5 text-[13px] text-steel">{items.length}</span>
                </h2>
                <ul className="divide-y divide-line">
                  {items.map((r) => (
                    <li key={`${r.table_name}-${r.record_id}-${r.issue}`}>
                      <Link href={editHref(r.table_name, r.record_id)} className="flex items-center gap-3 px-5 py-2.5 hover:bg-mist">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-semibold">{r.item}</span>
                          <span className="block text-[12.5px] text-steel">{AREA_LABEL[r.area] ?? r.area} · <span className={r.issue.includes('PDPA') ? 'font-semibold text-red' : ''}>{r.issue}</span></span>
                        </span>
                        <Pencil size={15} className="shrink-0 text-copper-dark" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
