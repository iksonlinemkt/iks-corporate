'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/** นับถอยหลังถึงเวลาเริ่มไลฟ์ · ถึงเวลาแล้วรีเฟรชหน้าให้เปลี่ยนเป็นจอไลฟ์ */
export function Countdown({ to }: { to: string }) {
  const router = useRouter();
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (now !== null && now >= target) router.refresh();
  }, [now, target, router]);
  const left = Math.max(0, target - (now ?? target));
  const parts = [
    ['วัน', Math.floor(left / 86400000)], ['ชั่วโมง', Math.floor(left / 3600000) % 24],
    ['นาที', Math.floor(left / 60000) % 60], ['วินาที', Math.floor(left / 1000) % 60],
  ] as const;
  return (
    <div className="flex gap-2 sm:gap-3" role="timer" aria-label="นับถอยหลังถึงเวลาไลฟ์">
      {parts.map(([label, n]) => (
        <div key={label} className="min-w-[64px] rounded-[var(--radius-card)] border border-white/15 bg-white/8 px-3 py-2 text-center sm:min-w-[78px]">
          <span className="block font-display text-[30px] font-bold leading-none tabular-nums text-white sm:text-[38px]">{now === null ? '--' : String(n).padStart(2, '0')}</span>
          <span className="mt-1 block text-[12px] text-white/65">{label}</span>
        </div>
      ))}
    </div>
  );
}
