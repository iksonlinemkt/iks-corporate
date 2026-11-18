import { mediaUrl } from '@/lib/format';
import type { Branch, Settings, Vehicle } from '@/lib/types';

/**
 * ภาพปกหน้าแรก: หัวข้อโครเมียมใหญ่ + เส้นแสงแดง บนรูปโชว์รูม
 * - พื้นหลัง: รูปที่ตั้งค่าใน cover_image หรือรูปโชว์รูมมาตรฐาน /cover/showroom.webp
 * - รถ: ไม่แสดงโดยปริยาย · ใส่ slug ใน cover_car เพื่อวางรถ cutout ด้านขวา
 */
export function CoverHero({ settings, vehicles, branches }: { settings: Settings; vehicles: Vehicle[]; branches: Branch[] }) {
  const title = settings.cover_title ?? 'ISUZU IKS';
  const line1 = settings.cover_line1 ?? settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์';
  const line2 = settings.cover_line2 ?? `ผู้จำหน่ายอีซูซุอย่างเป็นทางการ ตั้งแต่ พ.ศ. ${settings.founded_year ?? '2525'}`;
  const custom = mediaUrl(settings.cover_image);
  const carSlug = (settings.cover_car ?? 'none').trim();
  const car = !carSlug || carSlug === 'none' ? null
    : vehicles.find((v) => v.slug === carSlug && v.image_cutout) ?? vehicles.find((v) => v.slug.startsWith(carSlug) && v.image_cutout) ?? null;
  const carSrc = mediaUrl(car?.image_cutout);
  const names = branches.map((b) => b.name.replace(/^สาขา/, '')).filter(Boolean);

  return (
    <section aria-label="อีซูซุกรุงเทพเซลส์" className="cover relative overflow-hidden bg-[#07090d] text-white">
      {/* ฉากหลัง: รูปโชว์รูม */}
      {custom ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={custom} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-[56%_center] lg:object-[center_32%]" fetchPriority="high" />
      ) : (
        <picture>
          <source media="(max-width: 767px)" srcSet="/cover/showroom-m.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cover/showroom.webp" alt="โชว์รูมอีซูซุกรุงเทพเซลส์" width={2400} height={1351}
            className="absolute inset-0 h-full w-full object-cover object-[56%_center] lg:object-[center_32%]" fetchPriority="high" />
        </picture>
      )}
      {/* ไล่เงาให้อ่านตัวอักษรได้: มือถือไล่จากล่าง · คอมไล่จากซ้าย */}
      <span className="absolute inset-0 bg-linear-to-t from-[#060a14] via-[#060a14]/75 to-[#060a14]/0 lg:hidden" aria-hidden />
      <span className="absolute inset-0 hidden bg-linear-to-r from-[#060a14]/95 via-[#060a14]/75 via-42% to-transparent to-72% lg:block" aria-hidden />
      <span className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#060a14] to-transparent" aria-hidden />

      <div className={`container-x relative grid h-[calc(100svh-169px)] min-h-[520px] items-end lg:h-[min(calc(100svh-109px),56.25vw)] lg:min-h-[540px] lg:items-center 2xl:h-[min(calc(100svh-79px),56.25vw)] ${carSrc ? 'lg:grid-cols-[1.08fr_1fr]' : ''}`}>
        {/* ข้อความ */}
        <div className="relative z-10 pb-10 pt-32 sm:pb-14 lg:py-16">
          <h1 className="font-display leading-none">
            <span className="text-chrome-xl block whitespace-nowrap text-[clamp(52px,9.5vw,118px)] font-extrabold uppercase tracking-[-0.01em]">{title}</span>
            <span className="red-streak mt-3 block sm:mt-4" aria-hidden />
            <span className="mt-5 block text-[clamp(28px,4.2vw,50px)] font-bold leading-[1.15] text-white [text-shadow:0_3px_14px_rgb(0_0_0/0.8)]">{line1}</span>
          </h1>
          <p className="mt-2 text-[clamp(17px,2vw,25px)] font-semibold leading-snug text-white/90 [text-shadow:0_2px_10px_rgb(0_0_0/0.8)]">{line2}</p>
          {settings.group_name && (
            <p className="mt-2 font-display text-[clamp(15px,1.5vw,18px)] font-medium text-copper-light [text-shadow:0_1px_6px_rgb(0_0_0/0.8)]">
              ในเครือ{settings.group_name}{settings.group_since ? ` · ตั้งแต่ พ.ศ. ${settings.group_since}` : ''}
            </p>
          )}
          {names.length > 1 && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-[15px] font-medium text-white/75 [text-shadow:0_1px_6px_rgb(0_0_0/0.8)]">
              <span className="rounded-sm bg-white/10 px-2 py-0.5 text-[13px] font-bold text-white">{names.length} สาขา</span>
              {names.join(' · ')}
            </p>
          )}
        </div>

        {/* รถ */}
        {carSrc && (
          <div className="relative mt-6 pb-8 lg:mt-0 lg:pb-0">
            <span className="cover-spot" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={carSrc} alt={car?.name ?? 'อีซูซุ'} className="cover-car relative mx-auto w-full max-w-[760px] lg:w-[120%] lg:max-w-none" fetchPriority="high" />
          </div>
        )}
      </div>
    </section>
  );
}
