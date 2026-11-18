import { mediaUrl } from '@/lib/format';
import { getPreviewState } from '@/lib/content';

const SLOT_LABEL: Record<string, string> = {
  hero_desktop: 'แบนเนอร์ Hero (คอม) 1920×800',
  hero_mobile: 'แบนเนอร์ Hero (มือถือ) 750×1000',
  section_banner: 'แบนเนอร์ 1600×700',
  vehicle_card: 'รูปรุ่นรถ 1200×750',
  vehicle_cutout: 'รูปรถตัดพื้น 1200×800',
  vehicle_category: 'รูปหมวดรถ 800×600',
  body_type: 'รูปตัวถัง 800×600',
  industry: 'รูปประเภทธุรกิจ 800×600',
  promotion: 'รูปโปรโมชั่น 1200×900',
  service: 'รูปบริการ 1200×800',
  branch: 'รูปสาขา 1200×800',
  staff: 'รูปพนักงาน 800×800',
  activity_cover: 'รูปกิจกรรม 1200×800',
  timeline: 'รูปไทม์ไลน์ 800×600',
  mascot: 'Happy Whale 1000×1000',
};

/**
 * แสดงรูปจากโฟลเดอร์ media หรือช่องว่างลายทางถ้ายังไม่มีรูป
 * (โหมดพรีวิวจะบอกชื่อช่องและขนาดที่ต้องใช้)
 */
export async function Media({
  src, alt, slot, className = '', dark = false, priority = false, fit = 'cover', placeholder = 'pattern',
}: {
  src: string | null | undefined;
  alt: string;
  slot: keyof typeof SLOT_LABEL | string;
  className?: string;
  dark?: boolean;
  priority?: boolean;
  fit?: 'cover' | 'contain';
  /** none = ไม่มีลายทาง ปล่อยให้กราฟิกพื้นหลังแสดง */
  placeholder?: 'pattern' | 'none';
}) {
  // ยังไม่ได้อัปโหลดรูปมาสคอต → ใช้ Happy Whale ตัวมาตรฐาน
  const url = mediaUrl(src) ?? (slot === 'mascot' ? '/brand/happy-whale.png' : null);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
      />
    );
  }
  const preview = await getPreviewState();
  return (
    <div role="img" aria-label={alt} className={`${placeholder === 'none' ? (dark ? 'text-white/45' : 'text-navy/40') : dark ? 'ph-dark text-white/55' : 'ph text-navy/45'} flex items-center justify-center ${className}`}>
      {preview && (
        <span className="px-3 text-center text-xs font-medium leading-snug">
          ยังไม่มีรูป<br />{SLOT_LABEL[slot] ?? slot}
        </span>
      )}
    </div>
  );
}
