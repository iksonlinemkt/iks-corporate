import { redirect } from 'next/navigation';
import { Backdrop } from '@/components/Backdrop';
import { Wordmark } from '@/components/Brand';
import { currentUser } from '@/lib/admin/auth';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'เข้าสู่ระบบ' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentUser()) redirect('/admin');
  const { next = '/admin' } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      <Backdrop variant="hero" />
      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 flex justify-center"><Wordmark light className="h-14" /></div>
        <div className="rounded-[var(--radius-card)] bg-white p-7 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] sm:p-8">
          <h1 className="text-2xl font-bold text-navy">เข้าสู่ระบบหลังบ้าน</h1>
          <p className="mt-1 text-[14px] text-steel">สำหรับทีมงานอีซูซุกรุงเทพเซลส์</p>
          <div className="copper-metal my-6 h-[2px] w-12" aria-hidden />
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
