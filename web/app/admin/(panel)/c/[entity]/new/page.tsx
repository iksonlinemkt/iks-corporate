import { notFound } from 'next/navigation';
import { ENTITY_MAP } from '@/lib/admin/entities';
import { refOptions } from '@/lib/admin/crud';
import { mediaBase } from '@/lib/admin/serialize';
import { EntityForm } from '@/components/admin/EntityForm';
import { PageHead } from '@/components/admin/ui';
import { saveEntityAction } from '@/app/admin/actions';

type Props = { params: Promise<{ entity: string }>; searchParams: Promise<{ s?: string }> };

export default async function NewEntityPage({ params, searchParams }: Props) {
  const { entity } = await params;
  const { s } = await searchParams;
  const e = ENTITY_MAP[entity];
  if (!e || !e.canCreate) notFound();
  const refs = await refOptions(e);
  const defaults: Record<string, unknown> = {};
  if (e.scope && s) defaults[e.scope.field] = s;
  if (e.table === 'branches') Object.assign(defaults, { has_showroom: true, has_service: true, has_parts: true });

  return (
    <>
      <PageHead
        title={`เพิ่ม${e.single}`}
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }, { href: `/admin/c/${e.key}${s ? `?s=${s}` : ''}`, label: e.label }]}
      />
      <EntityForm
        fields={e.fields}
        values={defaults}
        refs={refs}
        mediaBase={mediaBase()}
        action={saveEntityAction.bind(null, e.key, null)}
        isNew
        scopeField={e.scope?.field}
        scopeValue={s}
      />
    </>
  );
}
