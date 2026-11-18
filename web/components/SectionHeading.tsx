import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Backdrop } from './Backdrop';

export function SectionHeading({
  title, subtitle, link, linkLabel = 'ดูทั้งหมด', light = false, id,
}: {
  title: string | null | undefined;
  subtitle?: string | null;
  link?: string | null;
  linkLabel?: string;
  light?: boolean;
  id?: string;
}) {
  if (!title) return null;
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-9">
      <div className="max-w-2xl">
        <span className="lane mb-3 block" aria-hidden />
        <h2 id={id} className="text-[26px] font-bold sm:text-[32px]"><span className={light ? 'text-chrome' : 'text-navy-metal'}>{title}</span></h2>
        {subtitle && <p className={`mt-2 text-[15px] sm:text-base ${light ? 'text-white/75' : 'text-steel'}`}>{subtitle}</p>}
      </div>
      {link && (
        <Link href={link} className={`inline-flex items-center gap-1 text-[15px] font-semibold ${light ? 'text-copper-light' : 'text-copper-dark'} hover:underline`}>
          {linkLabel}
          <ChevronRight size={18} aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function SectionShell({
  children, tone = 'white', id, className = '',
}: {
  children: React.ReactNode;
  tone?: 'white' | 'mist' | 'navy' | 'deep';
  id?: string;
  className?: string;
}) {
  const bg = tone === 'mist' ? 'bg-mist' : tone === 'navy' ? 'bg-navy text-white' : tone === 'deep' ? 'bg-navy-950 text-white' : 'bg-white';
  return (
    <section id={id} className={`${bg} relative scroll-mt-32 overflow-hidden 2xl:scroll-mt-24 py-14 sm:py-20 ${className}`}>
      {(tone === 'navy' || tone === 'deep') && <Backdrop variant="navy" />}
      {tone === 'mist' && <Backdrop variant="light" />}
      <div className="container-x relative">{children}</div>
    </section>
  );
}
