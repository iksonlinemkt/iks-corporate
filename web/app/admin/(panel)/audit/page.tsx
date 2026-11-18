import Link from 'next/link';
import { adminDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';
import { ENTITY_BY_TABLE } from '@/lib/admin/entities';
import { PageHead } from '@/components/admin/ui';

export const metadata = { title: 'ประวัติการแก้ไข' };

const ACTION = { INSERT: 'เพิ่ม', UPDATE: 'แก้ไข', DELETE: 'ลบ' } as Record<string, string>;
const SKIP = new Set(['updated_at', 'updated_by', 'created_at']);
const TABLE_LABEL: Record<string, string> = { site_settings: 'ตั้งค่าเว็บ', pages: 'SEO หน้าเว็บ', leads: 'Lead', admin_users: 'ผู้ใช้งาน' };

function changed(o: Record<string, unknown> | null, n: Record<string, unknown> | null) {
  if (!o || !n) return [];
  return Object.keys(n).filter((k) => !SKIP.has(k) && JSON.stringify(o[k]) !== JSON.stringify(n[k]));
}
const short = (v: unknown) => {
  const s = v === null || v === undefined ? '∅' : typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > 60 ? s.slice(0, 60) + '…' : s;
};

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdmin();
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { rows } = await adminDb().query(
    `select a.*, u.email, u.full_name from public.audit_log a left join public.admin_users u on u.id = a.changed_by
      where a.table_name not in ('admin_sessions', 'login_attempts', 'media_files')
      order by a.changed_at desc limit 100 offset $1`,
    [(page - 1) * 100],
  );
  return (
    <>
      <PageHead title="ประวัติการแก้ไข" desc="ใครแก้อะไร เมื่อไหร่ (100 รายการต่อหน้า)" crumbs={[{ href: '/admin', label: 'ภาพรวม' }]} />
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full min-w-[760px] text-left text-[14px]">
          <thead className="bg-mist font-display text-[13px]">
            <tr><th className="px-4 py-2.5">เวลา</th><th className="px-4 py-2.5">ผู้แก้</th><th className="px-4 py-2.5">รายการ</th><th className="px-4 py-2.5">การเปลี่ยนแปลง</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => {
              const n = r.new_data ?? r.old_data ?? {};
              const e = ENTITY_BY_TABLE[r.table_name];
              const name = n.title ?? n.name ?? n.full_name ?? n.label ?? n.key ?? n.email ?? n.slug ?? '';
              const diff = r.action === 'UPDATE' ? changed(r.old_data, r.new_data) : [];
              return (
                <tr key={r.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 text-steel">{new Date(r.changed_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' })}</td>
                  <td className="px-4 py-2.5">{r.full_name || r.email || <span className="text-steel">ระบบ / ลูกค้า</span>}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold">{ACTION[r.action]}</span> {e?.single ?? TABLE_LABEL[r.table_name] ?? r.table_name}
                    {name && (e && r.action !== 'DELETE'
                      ? <> · <Link href={`/admin/c/${e.key}/${r.record_id}`} className="text-copper-dark hover:underline">{short(name)}</Link></>
                      : <> · {short(name)}</>)}
                  </td>
                  <td className="px-4 py-2.5 text-[13px] text-steel">
                    {diff.length ? diff.slice(0, 4).map((k) => <div key={k}><span className="font-medium text-navy">{k}</span>: {short(r.old_data[k])} → {short(r.new_data[k])}</div>) : '-'}
                    {diff.length > 4 && <div>และอีก {diff.length - 4} ช่อง</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <nav className="mt-4 flex gap-2">
        {page > 1 && <Link href={`/admin/audit?page=${page - 1}`} className="rounded-md border border-line bg-white px-3 py-1.5 text-[14px] font-semibold">ใหม่กว่า</Link>}
        {rows.length === 100 && <Link href={`/admin/audit?page=${page + 1}`} className="rounded-md border border-line bg-white px-3 py-1.5 text-[14px] font-semibold">เก่ากว่า</Link>}
      </nav>
    </>
  );
}
