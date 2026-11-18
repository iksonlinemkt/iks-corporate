import { Sidebar } from '@/components/admin/Sidebar';
import { requireUser } from '@/lib/admin/auth';
import { adminDb } from '@/lib/db';
import { logoutAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const { rows: [c] } = await adminDb().query(
    `select (select count(*) from public.leads where status = 'new')::int as leads,
            (select count(*) from public.launch_checklist)::int as checklist`,
  );
  return (
    <>
      <Sidebar user={user} newLeads={c.leads} checklist={c.checklist} logout={logoutAction} />
      <main className="lg:pl-[264px]">
        <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:py-8">{children}</div>
      </main>
    </>
  );
}
