import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, Trash2 } from 'lucide-react';
import { ENTITY_MAP } from '@/lib/admin/entities';
import { getRow, refOptions } from '@/lib/admin/crud';
import { mediaBase, toFormValues } from '@/lib/admin/serialize';
import { EntityForm } from '@/components/admin/EntityForm';
import { ConfirmButton } from '@/components/admin/FormBits';
import { Notice, PageHead, StatusBadge, btn } from '@/components/admin/ui';
import { deleteEntityAction, saveEntityAction, toggleVisibleAction } from '@/app/admin/actions';

type Props = { params: Promise<{ entity: string; id: string }>; searchParams: Promise<{ created?: string; error?: string; back?: string }> };

/** ลิงก์ไปหน้าเว็บที่แสดงรายการนี้ */
function publicPath(table: string, row: Record<string, unknown>): string | null {
  switch (table) {
    case 'vehicles': return `/models/${row.slug}`;
    case 'hero_slides': case 'page_sections': return ({ home: '/', models: '/models', commercial: '/commercial', promotions: '/promotions', service: '/contact', activities: '/activities', 'happy-whale': '/happy-whale', about: '/about', contact: '/contact' } as Record<string, string>)[String(row.page_slug)] ?? null;
    case 'promotions': case 'promotion_categories': return '/promotions';
    case 'services': return row.group_key === 'commercial' ? '/commercial' : '/service';
    case 'body_types': case 'industries': return '/commercial';
    case 'branches': case 'staff': return '/contact';
    case 'activities': return '/happy-whale';
    case 'timeline_events': return '/about';
    case 'vehicle_categories': return row.segment === 'commercial' ? '/commercial' : '/models';
    default: return null;
  }
}

export default async function EditEntityPage({ params, searchParams }: Props) {
  const { entity, id } = await params;
  const sp = await searchParams;
  const e = ENTITY_MAP[entity];
  if (!e) notFound();
  const row = await getRow(e, id);
  if (!row) notFound();
  const refs = await refOptions(e);
  const back = sp.back?.startsWith('/admin') ? sp.back : `/admin/c/${e.key}${e.scope ? `?s=${row[e.scope.field]}` : ''}`;
  const pub = publicPath(e.table, row);
  const title = String(row[e.titleField] ?? e.single);

  return (
    <>
      <PageHead
        title={e.table === 'page_sections' ? `${row.label}` : title}
        desc={e.table === 'page_sections' ? 'แก้ข้อความของส่วนนี้ ช่องที่เว้นว่างจะไม่แสดง' : undefined}
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }, { href: back, label: e.label }]}
        actions={
          <>
            <StatusBadge status={row.status} visible={row.is_visible} />
            <form action={toggleVisibleAction.bind(null, e.key, id)}>
              <button className={btn.ghost}>{row.is_visible ? 'ซ่อนจากหน้าเว็บ' : 'แสดงบนหน้าเว็บ'}</button>
            </form>
            {pub && <Link href={`/admin/preview?to=${encodeURIComponent(pub)}`} target="_blank" prefetch={false} className={btn.ghost}><ExternalLink size={16} />ดูบนเว็บ</Link>}
          </>
        }
      />
      {sp.created && <Notice tone="ok">สร้างรายการแล้ว เพิ่มรูปหรือแก้ข้อมูลต่อได้เลย</Notice>}
      {sp.error && <Notice tone="error">{sp.error}</Notice>}
      {row.status === 'sample' && <Notice tone="warn">รายการนี้เป็น<strong>ข้อมูลตัวอย่าง</strong> คนทั่วไปมองไม่เห็น แก้เป็นข้อมูลจริงแล้วกด &quot;บันทึกและเผยแพร่&quot;</Notice>}

      <EntityForm
        fields={e.fields}
        values={toFormValues(e, row)}
        refs={refs}
        mediaBase={mediaBase()}
        action={saveEntityAction.bind(null, e.key, id)}
        isNew={false}
        status={row.status}
      />

      {e.canDelete && (
        <form action={deleteEntityAction.bind(null, e.key, id, back)} className="mt-8 flex items-center justify-between gap-4 rounded-[var(--radius-card)] border border-red/20 bg-white px-5 py-4">
          <p className="text-[14px] text-steel">ลบรายการนี้ถาวร (ถ้าแค่ไม่อยากให้แสดง ใช้ &quot;ซ่อนจากหน้าเว็บ&quot; แทน)</p>
          <ConfirmButton message={`ลบ "${title}" ถาวร?`} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-red/40 px-4 text-[14px] font-semibold text-red hover:bg-red hover:text-white">
            <Trash2 size={16} />ลบรายการ
          </ConfirmButton>
        </form>
      )}
    </>
  );
}
