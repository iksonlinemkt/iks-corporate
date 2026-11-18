import { adminDb } from '@/lib/db';
import { PageHead } from '@/components/admin/ui';
import { saveSettingsAction } from '@/app/admin/actions';
import { SettingsForm } from './SettingsForm';

export const metadata = { title: 'ตั้งค่าเว็บ' };

export default async function SettingsPage() {
  const { rows } = await adminDb().query('select key, label, group_name, value, status from public.site_settings order by sort_order');
  return (
    <>
      <PageHead
        title="ตั้งค่าเว็บ / ช่องทางติดต่อ"
        desc="ข้อมูลเหล่านี้ใช้ทั้งเว็บ: ฟุตเตอร์ หน้าติดต่อเรา และแถบปุ่มโทร / LINE บนมือถือ ช่องที่เว้นว่างจะไม่แสดง"
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }]}
      />
      <SettingsForm rows={rows} action={saveSettingsAction} />
    </>
  );
}
