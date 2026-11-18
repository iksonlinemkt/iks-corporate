import { Award, LifeBuoy, MapPin, ShieldCheck, Star, Trophy } from 'lucide-react';
import type { Settings } from '@/lib/types';

/** แถบความน่าเชื่อถือ: ปีก่อตั้ง · จำนวนสาขา · ศูนย์บริการ · คะแนนรีวิว */
export function TrustStrip({ settings, branches, rating, dark = false }: {
  settings: Settings; branches: number; rating?: { rating: number; count: number } | null; dark?: boolean;
}) {
  const founded = Number(settings.founded_year ?? 2525);
  const years = new Date().getFullYear() + 543 - founded;
  const items = [
    { icon: Award, title: `ตั้งแต่ พ.ศ. ${founded}`, sub: `ดูแลลูกค้ามากว่า ${years} ปี` },
    ...(settings.award_title ? [{ icon: Trophy, title: settings.award_title, sub: settings.award_detail ?? '' }] : []),
    ...(branches > 0 ? [{ icon: MapPin, title: `${branches} สาขา`, sub: 'โชว์รูมและศูนย์บริการ' }] : []),
    ...(settings.emergency_service
      ? [{ icon: LifeBuoy, title: 'ช่วยเหลือฉุกเฉิน 24 ชม.', sub: settings.phone_emergency ? `โทร ${settings.phone_emergency}` : 'ดูแลตลอดการใช้งาน' }]
      : [{ icon: ShieldCheck, title: 'ผู้จำหน่ายรถยนต์อีซูซุ', sub: 'อะไหล่แท้ ศูนย์บริการมาตรฐาน' }]),
    ...(rating ? [{ icon: Star, title: `รีวิว ${rating.rating.toFixed(1)} / 5`, sub: `จาก ${rating.count.toLocaleString('th-TH')} รีวิวบน Google` }] : []),
  ];
  return (
    <ul className={`grid grid-cols-2 gap-4 ${({ 5: 'lg:grid-cols-5', 4: 'lg:grid-cols-4', 3: 'lg:grid-cols-3' } as Record<number, string>)[items.length] ?? 'lg:grid-cols-2'}`}>
      {items.map(({ icon: I, title, sub }) => (
        <li key={title} className="flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-white/10 text-copper-light' : 'bg-copper/12 text-copper-dark'}`}><I size={21} aria-hidden /></span>
          <span>
            <span className={`block font-display text-[16px] font-bold leading-tight ${dark ? 'text-white' : 'text-navy'}`}>{title}</span>
            <span className={`block text-[13px] ${dark ? 'text-white/65' : 'text-steel'}`}>{sub}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
