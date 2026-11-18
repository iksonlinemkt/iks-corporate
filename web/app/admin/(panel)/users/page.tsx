import { adminDb } from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';
import { Notice, PageHead, Panel, btn } from '@/components/admin/ui';
import { createUserAction, resetPasswordAction, updateUserAction } from '@/app/admin/actions';
import { CreateUserForm, ResetPasswordForm } from './UserForms';

export const metadata = { title: 'ผู้ใช้งาน' };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await requireAdmin();
  const { error } = await searchParams;
  const { rows } = await adminDb().query(
    'select id, email, full_name, role, is_active, last_login_at, created_at from public.admin_users order by is_active desc, role, email',
  );
  return (
    <>
      <PageHead title="ผู้ใช้งานหลังบ้าน" desc="ผู้ดูแลระบบ: จัดการผู้ใช้และดูประวัติได้ · การตลาด: แก้เนื้อหาและดู Lead ได้" crumbs={[{ href: '/admin', label: 'ภาพรวม' }]} />
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title={`บัญชีทั้งหมด (${rows.length})`}>
          <ul className="-my-2 divide-y divide-line">
            {rows.map((u) => (
              <li key={u.id} className={`py-4 ${!u.is_active ? 'opacity-60' : ''}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{u.full_name || u.email}{u.id === me.id && <span className="ml-2 text-[12px] text-copper-dark">(คุณ)</span>}</p>
                  <p className="text-[12.5px] text-steel">
                    {u.last_login_at ? `เข้าล่าสุด ${new Date(u.last_login_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Bangkok' })}` : 'ยังไม่เคยเข้า'}
                  </p>
                </div>
                <p className="text-[13px] text-steel">{u.email}</p>
                <form action={updateUserAction.bind(null, u.id)} className="mt-2 flex flex-wrap items-center gap-3">
                  <select name="role" defaultValue={u.role} aria-label={`สิทธิ์ของ ${u.email}`} className="h-9 rounded-md border border-line bg-white px-2 text-[14px]">
                    <option value="marketing">การตลาด</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                  <label className="inline-flex items-center gap-2 text-[14px]">
                    <input type="checkbox" name="is_active" defaultChecked={u.is_active} className="h-4 w-4 accent-[var(--color-copper)]" />ใช้งานได้
                  </label>
                  <button className={btn.small}>บันทึก</button>
                </form>
                {u.id !== me.id && <ResetPasswordForm action={resetPasswordAction.bind(null, u.id)} email={u.email} />}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="เพิ่มผู้ใช้">
          <CreateUserForm action={createUserAction} />
        </Panel>
      </div>
    </>
  );
}
