import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { adminDb } from '@/lib/db';
import { PAGES } from '@/lib/admin/entities';
import { PageHead } from '@/components/admin/ui';
import { SITE_HOST } from '@/lib/site';

export const metadata = { title: 'หน้าเว็บ' };

export default async function PagesIndex() {
  const { rows } = await adminDb().query(`
    select p.slug, p.path,
      (select count(*) from public.page_sections s where s.page_slug = p.slug)::int as sections,
      (select count(*) from public.page_sections s where s.page_slug = p.slug and not s.is_visible)::int as hidden,
      (select count(*) from public.hero_slides h where h.page_slug = p.slug)::int as slides,
      (select count(*) from public.hero_slides h where h.page_slug = p.slug and h.status = 'published' and h.is_visible)::int as live_slides
    from public.pages p order by p.sort_order`);
  const label = Object.fromEntries(PAGES.map((p) => [p.value, p.label]));
  return (
    <>
      <PageHead title="หน้าเว็บ" desc="เลือกหน้าเพื่อแก้แบนเนอร์ ข้อความแต่ละส่วน เปิด/ปิด/เรียงลำดับส่วนต่างๆ และ SEO" crumbs={[{ href: '/admin', label: 'ภาพรวม' }]} />
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((p) => (
          <li key={p.slug}>
            <Link href={`/admin/pages/${p.slug}`} className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 hover:border-copper">
              <div className="flex-1">
                <p className="font-display text-[18px] font-bold">{label[p.slug] ?? p.slug}</p>
                <p className="text-[13px] text-steel">{SITE_HOST}{p.path === '/' ? '' : p.path}</p>
                <p className="mt-2 text-[13px] text-steel">
                  แบนเนอร์ {p.live_slides}/{p.slides} แสดงอยู่ · {p.sections} ส่วน{p.hidden ? ` (ซ่อน ${p.hidden})` : ''}
                </p>
              </div>
              <ChevronRight className="text-copper-dark" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
