'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MessageCircle, X } from 'lucide-react';

/** ปุ่มลูกศรวงกลม (ใช้ทั้งในการ์ดและหน้าขยาย) */
function Arrow({ dir, onClick, className = '' }: { dir: 'prev' | 'next'; onClick: () => void; className?: string }) {
  const I = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button type="button" onClick={onClick} aria-label={dir === 'prev' ? 'รูปก่อนหน้า' : 'รูปถัดไป'}
      className={`flex items-center justify-center rounded-full bg-white/90 text-navy shadow hover:bg-white ${className}`}>
      <I size={22} />
    </button>
  );
}

/** สไลด์แนวนอนแบบปัดได้ คืนค่า index ปัจจุบัน + ฟังก์ชันเลื่อน */
function useSlider(count: number) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const go = useCallback((i: number, smooth = true) => {
    const el = track.current;
    if (!el || count === 0) return;
    const n = (i + count) % count;
    el.scrollTo({ left: n * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  }, [count]);
  const onScroll = () => {
    const el = track.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };
  return { track, index, go, onScroll };
}

/** หน้าขยายรูปเต็มจอ */
export function Lightbox({ name, href, images, start, onClose, alts }: {
  name: string; href?: string; images: string[]; start: number; onClose: () => void; alts?: (string | null)[];
}) {
  const { track, index, go, onScroll } = useSlider(images.length);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    go(start, false);
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [go, start]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (e.key === 'ArrowRight') go(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`รูป ${name}`} className="fixed inset-0 z-[100] flex flex-col bg-navy-950/95 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
        <p className="font-display text-lg font-bold">
          {name}
          {images.length > 1 && <span className="ml-3 text-[14px] font-normal text-white/60">{index + 1} / {images.length}</span>}
        </p>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label="ปิด"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X size={22} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={track} onScroll={onScroll}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <div key={src} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-3 sm:px-16"
              onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={alts?.[i] ?? `${name} ${i + 1}`} loading={Math.abs(i - index) <= 1 ? 'eager' : 'lazy'} className="max-h-full max-w-full rounded-[var(--radius-card)] object-contain shadow-2xl" draggable={false} />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <Arrow dir="prev" onClick={() => go(index - 1)} className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 sm:flex" />
            <Arrow dir="next" onClick={() => go(index + 1)} className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 sm:flex" />
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-4">
        {images.length > 1 && images.length <= 15 && (
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => go(i)} aria-label={`ดูรูปที่ ${i + 1}`} aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-copper-light' : 'w-2.5 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
        )}
        {href && (
          <Link href={href} className="btn btn-primary min-h-[44px] px-5 text-[15px]">
            <MessageCircle size={18} aria-hidden />สอบถามรายละเอียด
          </Link>
        )}
      </div>
    </div>
  );
}

/** การ์ดประเภทธุรกิจ: เลื่อนดูได้หลายรูป · กดที่รูปเพื่อขยาย */
export function IndustryCard({ name, href, images, aspect = 'aspect-[4/3]', showName = true, nameHref }: {
  name: string; href?: string; images: string[]; aspect?: string; showName?: boolean; nameHref?: string;
}) {
  const { track, index, go, onScroll } = useSlider(images.length);
  const [open, setOpen] = useState<number | null>(null);
  const many = images.length > 1;

  return (
    <div className="group relative overflow-hidden rounded-[var(--radius-card)] bg-navy" role="group" aria-roledescription="สไลด์" aria-label={name}>
      <div ref={track} onScroll={onScroll}
        className={`flex ${aspect} snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
        {images.length === 0 ? (
          <div className="ph-dark h-full w-full shrink-0" />
        ) : images.map((src, i) => (
          <button key={src} type="button" onClick={() => setOpen(i)} className="relative block h-full w-full shrink-0 cursor-zoom-in snap-center"
            tabIndex={i === index ? 0 : -1} aria-label={`ขยายรูป ${name} รูปที่ ${i + 1} จาก ${images.length}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${name} ${i + 1}`} loading="lazy" decoding="async" draggable={false}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          </button>
        ))}
      </div>

      {showName && (
        <>
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-navy-950/85 to-transparent" aria-hidden />
          {nameHref ? (
            <Link href={nameHref} className="absolute bottom-0 left-0 inline-flex items-center gap-1 p-4 font-display text-lg font-bold text-white hover:text-copper-light">
              {name}<ChevronRight size={18} aria-hidden />
            </Link>
          ) : (
            <span className="pointer-events-none absolute bottom-0 left-0 p-4 font-display text-lg font-bold text-white">{name}</span>
          )}
        </>
      )}

      {many && (
        <>
          <Arrow dir="prev" onClick={() => go(index - 1)}
            className="absolute left-2 top-[42%] hidden h-9 w-9 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:flex" />
          <Arrow dir="next" onClick={() => go(index + 1)}
            className="absolute right-2 top-[42%] hidden h-9 w-9 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:flex" />
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {images.length > 12 ? <span className="rounded-full bg-navy-950/70 px-2.5 py-0.5 text-[13px] font-semibold text-white">{index + 1} / {images.length}</span> : images.map((_, i) => (
              <button key={i} type="button" onClick={() => go(i)} aria-label={`ดูรูปที่ ${i + 1}`} aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-5 bg-copper-light' : 'w-2 bg-white/60 hover:bg-white'}`} />
            ))}
          </div>
        </>
      )}

      {open !== null && createPortal(<Lightbox name={name} href={href} images={images} start={open} onClose={() => setOpen(null)} />, document.body)}
    </div>
  );
}
