import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, Plus } from 'lucide-react';
import { adminDb } from '@/lib/db';
import { ENTITY_MAP, PAGES } from '@/lib/admin/entities';
import { listRows } from '@/lib/admin/crud';
import { mediaBase } from '@/lib/admin/serialize';
import { EntityList } from '@/components/admin/EntityList';
import { PageHead, btn } from '@/components/admin/ui';
import { savePageSeoAction } from '@/app/admin/actions';
import { SeoForm } from './SeoForm';

export default async function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const label = PAGES.find((p) => p.value === slug)?.label;
  if (!label) notFound();
  const { rows: [page] } = await adminDb().query('select slug, path, seo_title, seo_description, og_image from public.pages where slug = $1', [slug]);
  if (!page) notFound();
  const hero = ENTITY_MAP.hero;
  const sections = ENTITY_MAP.sections;
  const [slides, secs] = await Promise.all([listRows(hero, slug), listRows(sections, slug)]);
  const back = `/admin/pages/${slug}`;

  return (
    <>
      <PageHead
        title={`หน้าเว็บ: ${label}`}
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }, { href: '/admin/pages', label: 'หน้าเว็บ' }]}
        actions={<Link href={`/admin/preview?to=${encodeURIComponent(page.path)}`} target="_blank" prefetch={false} className={btn.ghost}><ExternalLink size={16} />ดูหน้านี้บนเว็บ</Link>}
      />

      <section className="mb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold">แบนเนอร์ด้านบน</h2>
            <p className="text-[14px] text-steel">มีหลายสไลด์ได้ จะสลับให้เองทุก 7 วินาที · ตั้งวันเริ่ม-หยุดแสดงได้ในแต่ละสไลด์</p>
          </div>
          <Link href={`/admin/c/hero/new?s=${slug}`} className={btn.primary}><Plus size={16} />เพิ่มสไลด์</Link>
        </div>
        <EntityList e={hero} rows={slides} back={back} />
      </section>

      <section className="mb-8">
        <div className="mb-3">
          <h2 className="text-[20px] font-bold">ส่วนต่างๆ ของหน้า</h2>
          <p className="text-[14px] text-steel">เรียงลำดับ = ลำดับบนหน้าเว็บ · กด &quot;ซ่อน&quot; ถ้าไม่ต้องการให้ส่วนนั้นแสดง · กด &quot;แก้ไข&quot; เพื่อเปลี่ยนหัวข้อและข้อความ</p>
        </div>
        <EntityList e={sections} rows={secs} back={back} />
      </section>

      <section>
        <h2 className="mb-3 text-[20px] font-bold">SEO และการแชร์ลิงก์</h2>
        <SeoForm
          action={savePageSeoAction.bind(null, slug)}
          values={{ seo_title: page.seo_title ?? '', seo_description: page.seo_description ?? '', og_image: page.og_image }}
          mediaBase={mediaBase()}
        />
      </section>
    </>
  );
}
