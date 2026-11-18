import Link from 'next/link';
import { ChevronRight, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/format';

/** แถบหน้าแรก: ใหม่! 2.2 Bi-Turbo (ต่อจากภาพปก) */
export function BiturboBand({ from, models, href = '/biturbo', bg }: { from: number | null; models: string[]; href?: string; bg?: string | null }) {
  return (
    <section aria-label="อีซูซุ 2.2 Bi-Turbo ใหม่" className="relative overflow-hidden bg-linear-to-r from-[#1a0507] via-[#3a0a0f] to-[#060a14] text-white">
      {bg && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bg} alt="" aria-hidden loading="lazy" className="absolute inset-y-0 right-0 h-full w-full object-cover opacity-60 lg:w-[65%]" />
          <span className="absolute inset-0 bg-linear-to-r from-[#1a0507] via-[#1a0507]/90 via-45% to-[#060a14]/30" aria-hidden />
        </>
      )}
      <span className="absolute inset-y-0 left-0 w-1.5 bg-red" aria-hidden />
      <div className="container-x relative flex flex-col gap-5 py-7 lg:flex-row lg:items-center lg:justify-between lg:py-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red sm:flex"><Zap size={28} aria-hidden /></span>
          <div>
            <p className="font-display text-[13px] font-bold tracking-[0.14em] text-[#ff8a8f]">ใหม่! เครื่องยนต์ไบเทอร์โบ</p>
            <h2 className="font-display text-[26px] font-extrabold leading-tight sm:text-[32px]">
              2.2 Ddi MAXFORCE <span className="text-gold">Bi-Turbo</span>
            </h2>
            <p className="mt-1 text-[15px] text-white/80 sm:text-[16px]">
              204 แรงม้า · 500 นิวตันเมตร · เกียร์อัตโนมัติ 8 สปีด
              {models.length > 0 && <span className="hidden md:inline"> · {models.join(' / ')}</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {from !== null && <p className="text-[15px] text-white/80">ราคาเริ่มต้น <b className="font-display text-[24px] text-white">{formatPrice(from)}</b> บาท</p>}
          <Link href={href} className="btn btn-red">ดูรุ่นและราคา<ChevronRight size={18} aria-hidden /></Link>
        </div>
      </div>
    </section>
  );
}
