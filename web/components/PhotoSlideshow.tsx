'use client';

import { useEffect, useRef, useState } from 'react';

/** ภาพพื้นหลังแบบสไลด์โชว์ (เฟดสลับเอง ทุก 5 วิ · ปัดบนมือถือได้ · หยุดเมื่อผู้ใช้ตั้งค่าลดการเคลื่อนไหว) */
export function PhotoSlideshow({ images, interval = 5000, className = '' }: {
  images: { src: string; alt: string | null }[]; interval?: number; className?: string;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const n = images.length;

  useEffect(() => {
    if (n < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), interval);
    return () => clearInterval(t);
  }, [n, paused, interval]);

  if (!n) return null;
  return (
    <div className={`absolute inset-0 ${className}`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 40) setI((x) => (x + (dx < 0 ? 1 : -1) + n) % n);
        touch.current = null;
      }}>
      {images.map((im, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={im.src} src={im.src} alt={k === i ? (im.alt ?? '') : ''} aria-hidden={k !== i}
          loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'} decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${k === i ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      {n > 1 && (
        <div className="absolute bottom-5 right-5 z-10 flex max-w-[60%] flex-wrap justify-end gap-1.5 sm:bottom-6 sm:right-8">
          {images.slice(0, 12).map((_, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={`ดูรูปที่ ${k + 1}`} aria-current={k === i}
              className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-2 bg-white/45 hover:bg-white/80'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
