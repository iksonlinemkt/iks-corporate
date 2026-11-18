import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Send } from 'lucide-react';
import { ENTITY_MAP } from '@/lib/admin/entities';
import { listRows } from '@/lib/admin/crud';
import { EntityList } from '@/components/admin/EntityList';
import { Notice, PageHead, btn } from '@/components/admin/ui';
import { publishAllDraftsAction } from '@/app/admin/actions';

type Props = { params: Promise<{ entity: string }>; searchParams: Promise<{ s?: string; error?: string }> };

export async function generateMetadata({ params }: Props) {
  return { title: ENTITY_MAP[(await params).entity]?.label ?? 'ไม่พบ' };
}

export default async function EntityListPage({ params, searchParams }: Props) {
  const { entity } = await params;
  const sp = await searchParams;
  const e = ENTITY_MAP[entity];
  if (!e) notFound();
  const scopeOpts = e.scope?.options ?? [];
  const scope = e.scope ? (scopeOpts.some((o) => o.value === sp.s) ? sp.s! : scopeOpts[0]?.value ?? '') : '';
  const rows = await listRows(e, scope || undefined);
  const drafts = rows.filter((r) => r.status === 'draft').length;
  const samples = rows.filter((r) => r.status === 'sample').length;

  return (
    <>
      <PageHead
        title={e.label}
        desc={e.hint}
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }]}
        actions={
          <>
            {drafts > 0 && (
              <form action={publishAllDraftsAction.bind(null, e.key, scope)}>
                <button className={btn.ghost}><Send size={16} />เผยแพร่ร่างทั้งหมด ({drafts})</button>
              </form>
            )}
            {e.canCreate && (
              <Link href={`/admin/c/${e.key}/new${scope ? `?s=${scope}` : ''}`} className={btn.primary}><Plus size={17} />เพิ่ม{e.single}</Link>
            )}
          </>
        }
      />
      {sp.error && <Notice tone="error">{sp.error}</Notice>}
      {samples > 0 && (
        <Notice tone="warn">มี {samples} รายการที่ยังเป็น<strong>ข้อมูลตัวอย่าง</strong> (คนทั่วไปมองไม่เห็น) เปิดแก้เป็นข้อมูลจริงแล้วกด &quot;บันทึกและเผยแพร่&quot;</Notice>
      )}

      {e.scope && (
        <nav aria-label={e.scope.label} className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {scopeOpts.map((o) => (
            <Link key={o.value} href={`/admin/c/${e.key}?s=${o.value}`} aria-current={o.value === scope ? 'page' : undefined}
              className={`shrink-0 rounded-md border px-3.5 py-2 text-[14px] font-semibold ${o.value === scope ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-copper'}`}>
              {o.label}
            </Link>
          ))}
        </nav>
      )}

      <EntityList e={e} rows={rows} back={`/admin/c/${e.key}${scope ? `?s=${scope}` : ''}`} />
      <p className="mt-3 text-[13px] text-steel">ลำดับในรายการนี้ = ลำดับที่แสดงบนหน้าเว็บ · &quot;ซ่อน&quot; = เก็บไว้แต่ไม่แสดงบนเว็บ</p>
    </>
  );
}
