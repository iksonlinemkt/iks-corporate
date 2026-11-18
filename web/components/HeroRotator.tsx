'use client';

import { Children, useEffect, useState } from 'react';

/** สลับสไลด์ Hero ทุก 7 วินาที หยุดเมื่อเอาเมาส์ชี้/โฟกัส และไม่หมุนเองถ้าผู้ใช้ตั้งลดการเคลื่อนไหว */
export function HeroRotator({ children, labels }: { children: React.ReactNode; labels: string[] }) {
  const slides = Children.toArray(children);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused || slides.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((s, idx) => (
        <div
          key={idx}
          aria-hidden={idx !== i}
          inert={idx !== i}
          className={`transition-opacity duration-700 ${idx === i ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'}`}
        >
          {s}
        </div>
      ))}
      <div className="absolute bottom-14 right-4 z-10 flex gap-2 sm:right-6 lg:bottom-16">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            aria-label={`สไลด์ ${idx + 1}: ${labels[idx] ?? ''}`}
            aria-current={idx === i}
            className={`h-2.5 rounded-full transition-all ${idx === i ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
}
