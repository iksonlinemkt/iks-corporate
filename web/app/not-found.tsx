import Link from 'next/link';
import { Wordmark } from '@/components/Brand';
import { Backdrop } from '@/components/Backdrop';

export default function NotFound() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-navy-950 text-white">
      <Backdrop variant="hero" />
      <div className="container-x relative py-16 sm:py-24">
        <Link href="/" aria-label="หน้าหลัก" className="mb-16 inline-block"><Wordmark light /></Link>
        <span className="lane mb-4 block" aria-hidden />
        <h1 className="text-4xl font-bold sm:text-5xl">ไม่พบหน้าที่คุณเปิด</h1>
        <p className="mt-4 max-w-lg text-lg text-white/75">ลิงก์อาจเปลี่ยนไปแล้ว ลองเริ่มจากหน้าหลัก หรือดูรุ่นรถทั้งหมด</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">กลับหน้าหลัก</Link>
          <Link href="/models" className="btn btn-ghost-light">ดูรุ่นรถ</Link>
        </div>
      </div>
    </section>
  );
}
