import { requireUser } from '@/lib/admin/auth';
import { PageHead, Panel } from '@/components/admin/ui';
import { changeOwnPasswordAction } from '@/app/admin/actions';
import { PasswordForm } from './PasswordForm';

export const metadata = { title: 'เปลี่ยนรหัสผ่าน' };

export default async function AccountPage() {
  const me = await requireUser();
  return (
    <>
      <PageHead title="เปลี่ยนรหัสผ่าน" desc={me.email} crumbs={[{ href: '/admin', label: 'ภาพรวม' }]} />
      <Panel className="max-w-lg"><PasswordForm action={changeOwnPasswordAction} /></Panel>
    </>
  );
}
