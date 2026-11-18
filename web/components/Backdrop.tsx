import { useId } from 'react';

/**
 * กราฟิกพื้นหลังธีม "ทุกเส้นทาง"
 *  hero  : เส้นทางโค้งหลายเส้น + ถนนเส้นหลักเส้นประ + แสงไฟ copper + เรืองแสงด้านขวา
 *  navy  : เส้นคอนทัวร์มุมขวา + เรืองแสง copper จาง ๆ
 *  light : แผนที่เส้นทางจุดประจาง ๆ มุมขวาบน (พื้นขาว/เทา)
 *  band  : เส้นทางบาง ๆ สำหรับแถบแคบ (footer, แบนเนอร์)
 * วางเป็นชั้นล่างสุดของ section ที่มี relative + overflow-hidden
 */
export function Backdrop({ variant, className = '' }: { variant: 'hero' | 'navy' | 'light' | 'band'; className?: string }) {
  const id = useId().replace(/:/g, '');
  if (variant === 'hero') return <HeroArt id={id} className={className} />;
  if (variant === 'navy') return <NavyArt id={id} className={className} />;
  if (variant === 'band') return <BandArt id={id} className={className} />;
  return <LightArt id={id} className={className} />;
}

/** เส้นโค้งขนานแบบทางหลวงที่ไหลผ่านเนินเขา */
function routes(count: number, opts: { x0: number; x1: number; y0: number; gap: number; lift: number; drop: number; skew: number }) {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const y = opts.y0 + i * opts.gap;
    const k = i * opts.skew;
    out.push(
      `M ${opts.x0} ${y} C ${opts.x0 + (opts.x1 - opts.x0) * 0.3} ${y - opts.lift + k}, ${opts.x0 + (opts.x1 - opts.x0) * 0.62} ${y + opts.drop - k}, ${opts.x1} ${y - opts.lift * 0.4}`,
    );
  }
  return out;
}

function HeroArt({ id, className }: { id: string; className: string }) {
  const lines = routes(16, { x0: 420, x1: 1560, y0: 250, gap: 26, lift: 210, drop: 150, skew: 6 });
  const streaks = [
    { x: 760, y: 560, w: 520, o: 0.85 },
    { x: 930, y: 512, w: 360, o: 0.6 },
    { x: 1080, y: 600, w: 300, o: 0.5 },
    { x: 640, y: 618, w: 260, o: 0.35 },
  ];
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(70%_80%_at_82%_38%,rgb(194_124_69/0.28),transparent_62%),radial-gradient(60%_60%_at_8%_100%,rgb(30_79_168/0.35),transparent_70%)]" />
      <svg className="absolute inset-0 h-full w-full max-lg:-translate-y-[46%] max-lg:scale-125" viewBox="0 0 1440 680" preserveAspectRatio="xMaxYMid slice">
        <defs>
          <linearGradient id={`${id}f`} x1="0" x2="1">
            <stop offset="0" stopColor="#e2ab7b" stopOpacity="0" />
            <stop offset="0.45" stopColor="#e2ab7b" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c27c45" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="0" x2="1">
            <stop offset="0" stopColor="#e2ab7b" stopOpacity="0" />
            <stop offset="0.7" stopColor="#f3c99f" stopOpacity="1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${id}r`} x1="0" x2="1">
            <stop offset="0" stopColor="#0c2346" stopOpacity="0" />
            <stop offset="0.35" stopColor="#15335e" stopOpacity="0.9" />
            <stop offset="1" stopColor="#1f4275" stopOpacity="0.9" />
          </linearGradient>
          <filter id={`${id}g`} x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* เส้นทางโค้ง */}
        <g fill="none" stroke={`url(#${id}f)`} strokeWidth="1">
          {lines.map((d, i) => <path key={i} d={d} opacity={0.25 + (i % 4) * 0.12} />)}
        </g>

        {/* ถนนเส้นหลัก */}
        <path d="M 360 700 C 760 600, 1040 470, 1500 430" fill="none" stroke={`url(#${id}r)`} strokeWidth="64" strokeLinecap="round" />
        <path d="M 360 700 C 760 600, 1040 470, 1500 430" fill="none" stroke="#e2ab7b" strokeOpacity="0.75" strokeWidth="3" strokeDasharray="34 26" />
        <path d="M 360 734 C 760 634, 1040 504, 1500 464" fill="none" stroke="#e2ab7b" strokeOpacity="0.3" strokeWidth="1.5" />
        <path d="M 360 666 C 760 566, 1040 436, 1500 396" fill="none" stroke="#e2ab7b" strokeOpacity="0.3" strokeWidth="1.5" />

        {/* แสงไฟวิ่ง */}
        <g transform="rotate(-11 1000 560)">
          {streaks.map((s, i) => (
            <g key={i}>
              <rect x={s.x} y={s.y - 2} width={s.w} height="4" rx="2" fill={`url(#${id}s)`} opacity={s.o * 0.6} filter={`url(#${id}g)`} />
              <rect x={s.x} y={s.y - 0.75} width={s.w} height="1.5" rx="1" fill={`url(#${id}s)`} opacity={s.o} />
            </g>
          ))}
        </g>

        {/* จุดหมุด */}
        <g fill="#e2ab7b">
          <circle cx="1186" cy="214" r="4" opacity="0.9" />
          <circle cx="1186" cy="214" r="14" fill="none" stroke="#e2ab7b" strokeOpacity="0.4" />
          <circle cx="1338" cy="318" r="3" opacity="0.6" />
          <circle cx="1018" cy="152" r="2.5" opacity="0.5" />
        </g>
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(0deg,#061630_0%,rgb(6_22_48/0.9)_38%,rgb(6_22_48/0)_70%)] lg:bg-[linear-gradient(90deg,#061630_0%,rgb(6_22_48/0.86)_34%,rgb(6_22_48/0)_70%)]" />
    </div>
  );
}

function NavyArt({ id, className }: { id: string; className: string }) {
  const rings = Array.from({ length: 11 }, (_, i) => i);
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(55%_70%_at_100%_0%,rgb(194_124_69/0.2),transparent_65%),radial-gradient(50%_60%_at_0%_100%,rgb(30_79_168/0.3),transparent_70%)]" />
      <svg className="absolute -right-24 -top-24 h-[620px] w-[760px]" viewBox="0 0 760 620" fill="none">
        <defs>
          <linearGradient id={`${id}c`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e2ab7b" stopOpacity="0.8" />
            <stop offset="0.75" stopColor="#e2ab7b" stopOpacity="0.08" />
            <stop offset="1" stopColor="#e2ab7b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {rings.map((i) => {
          const r = 60 + i * 42;
          return (
            <path
              key={i}
              d={`M ${640 - r} 120 C ${640 - r} ${120 - r * 0.62}, ${640 + r * 0.4} ${120 - r * 0.9}, ${640 + r * 0.9} ${120 - r * 0.3} S ${640 + r * 0.7} ${120 + r * 1.05}, ${640 - r * 0.2} ${120 + r * 0.95} S ${640 - r} ${120 + r * 0.55}, ${640 - r} 120 Z`}
              stroke={`url(#${id}c)`}
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
}

function LightArt({ id, className }: { id: string; className: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <svg className="absolute -right-10 -top-6 h-[420px] w-[640px]" viewBox="0 0 640 420" fill="none">
        <defs>
          <linearGradient id={`${id}l`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c27c45" stopOpacity="0.45" />
            <stop offset="1" stopColor="#c27c45" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M 640 40 C 520 60, 470 160, 360 170 S 160 120, 40 260" stroke={`url(#${id}l)`} strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
        <path d="M 640 130 C 560 150, 500 240, 400 250 S 230 230, 120 380" stroke={`url(#${id}l)`} strokeWidth="1.5" strokeDasharray="2 8" strokeLinecap="round" />
        <path d="M 600 0 C 590 80, 520 120, 470 210 S 420 330, 300 420" stroke="#0c2346" strokeOpacity="0.07" strokeWidth="18" strokeLinecap="round" />
        <circle cx="360" cy="170" r="5" fill="#c27c45" fillOpacity="0.5" />
        <circle cx="360" cy="170" r="13" stroke="#c27c45" strokeOpacity="0.25" />
        <circle cx="400" cy="250" r="3.5" fill="#c27c45" fillOpacity="0.35" />
      </svg>
    </div>
  );
}

function BandArt({ id, className }: { id: string; className: string }) {
  const lines = routes(9, { x0: -40, x1: 1480, y0: 40, gap: 30, lift: 90, drop: 110, skew: 4 });
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <linearGradient id={`${id}b`} x1="0" x2="1">
            <stop offset="0" stopColor="#e2ab7b" stopOpacity="0" />
            <stop offset="0.6" stopColor="#e2ab7b" stopOpacity="0.22" />
            <stop offset="1" stopColor="#e2ab7b" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <g stroke={`url(#${id}b)`} strokeWidth="1">
          {lines.map((d, i) => <path key={i} d={d} />)}
        </g>
      </svg>
    </div>
  );
}
