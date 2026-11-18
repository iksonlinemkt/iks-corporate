/**
 * นิยามหน้าจอแก้ไขข้อมูลในหลังบ้าน (ใช้ทั้งฝั่ง server และฟอร์ม)
 * ชื่อตาราง/คอลัมน์มาจากไฟล์นี้เท่านั้น ไม่รับจากผู้ใช้ → ปลอดภัยจาก SQL injection
 */

export type FieldType =
  | 'text' | 'textarea' | 'number' | 'url' | 'image' | 'images' | 'select' | 'ref'
  | 'bool' | 'datetime' | 'date' | 'strings' | 'colors' | 'specs' | 'icon' | 'slug'
  /** ตัวช่วยค้นหาสถานที่ (ไม่ได้บันทึกเอง แค่เติมช่องอื่น) */
  | 'placefinder';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  max?: number;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  ref?: { table: string; label: string; where?: string };
  slot?: ImageSlot;
  /** แสดงเฉพาะตอนสร้างใหม่ (แก้ไขไม่ได้ภายหลัง) */
  createOnly?: boolean;
  wide?: boolean;
};

export type Entity = {
  key: string;
  table: string;
  label: string;
  single: string;
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  fields: Field[];
  /** แบ่งกลุ่ม/กรองรายการตามคอลัมน์นี้ (เช่น page_slug, group_key) */
  scope?: { field: string; label: string; options?: { value: string; label: string }[] };
  canCreate?: boolean;
  canDelete?: boolean;
  orderBy?: string;
  hint?: string;
};

export type ImageSlot = keyof typeof IMAGE_SLOTS;

export const IMAGE_SLOTS = {
  hero_desktop: { w: 1920, h: 800, label: 'แบนเนอร์คอม 1920×800 · วางรถครึ่งขวา เว้นซ้ายไว้ให้ข้อความ' },
  hero_mobile: { w: 750, h: 1000, label: 'แบนเนอร์มือถือ 750×1000 · วางรถครึ่งบน เว้นครึ่งล่างให้ข้อความ' },
  section_banner: { w: 1600, h: 700, label: '1600×700 · กล่อง Happy Whale ใช้ PNG พื้นใส 1000×1000' },
  vehicle_card: { w: 1200, h: 750, label: 'รูปการ์ดรุ่นรถ 1200×750 (มีฉากหลัง)' },
  vehicle_cutout: { w: 1200, h: 800, label: 'รูปรถตัดพื้น PNG พื้นใส 1200×800' },
  vehicle_gallery: { w: 1600, h: 1067, label: 'แกลเลอรี 1600×1067 · เลือกหลายรูปพร้อมกันได้' },
  vehicle_category: { w: 800, h: 600, label: 'รูปหมวดรถ 800×600 (PNG พื้นใสดีที่สุด)' },
  body_type: { w: 800, h: 600, label: 'รูปตัวถัง 800×600 (PNG พื้นใสดีที่สุด)' },
  industry: { w: 1200, h: 900, label: 'รูปประเภทธุรกิจ 1200×900 (แนวนอน 4:3) · วางรถช่วงบน เว้นมุมซ้ายล่างให้ชื่อหมวด' },
  promotion: { w: 1200, h: 900, label: 'รูปโปรโมชั่น 1200×900 · ไม่ต้องใส่ตัวหนังสือบนรูป ระบบใส่ให้' },
  service: { w: 1200, h: 800, label: 'รูปบริการ 1200×800' },
  highlight: { w: 600, h: 600, label: 'รูปประกอบ 600×600' },
  branch: { w: 1200, h: 800, label: 'รูปหน้าโชว์รูม 1200×800' },
  staff: { w: 800, h: 800, label: 'รูปพนักงาน 800×800 หน้าตรง พื้นเรียบ' },
  gallery: { w: 2000, h: 1250, label: 'รูปแกลเลอรี กว้างไม่เกิน 2000 px (แนวนอนสวยที่สุด)' },
  activity_cover: { w: 1200, h: 800, label: 'รูปปกกิจกรรม 1200×800' },
  community_cover: { w: 1600, h: 900, label: 'รูปปกคลับ 1600×900 (แนวนอน)' },
  community_logo: { w: 600, h: 600, label: 'โลโก้คลับ 600×600 (PNG พื้นใสดีที่สุด)' },
  community_post: { w: 1600, h: 1200, label: 'รูปในโพสต์ · เลือกหลายรูปพร้อมกันได้' },
  activity_gallery: { w: 1600, h: 1067, label: 'แกลเลอรีกิจกรรม 1600×1067 · เลือกหลายรูปพร้อมกันได้' },
  timeline: { w: 800, h: 600, label: 'รูปไทม์ไลน์ 800×600' },
  og_image: { w: 1200, h: 630, label: 'รูปตอนแชร์ลิงก์ (Facebook/LINE) 1200×630' },
} as const;

export const GALLERY_GROUPS = [
  { value: 'biturbo-dmax', label: 'Bi-Turbo · D-MAX' }, { value: 'biturbo-mux', label: 'Bi-Turbo · MU-X' },
];
const SEGMENTS = [{ value: 'pickup', label: 'รถปิกอัพ' }, { value: 'ppv', label: 'รถอเนกประสงค์ PPV' }];
const FAQ_GROUPS = [
  { value: 'general', label: 'ทั่วไป (หน้ารุ่นรถ)' }, { value: 'commercial', label: 'รถเพื่อการพาณิชย์' },
  { value: 'test_drive', label: 'ทดลองขับ' }, { value: 'service', label: 'ศูนย์บริการ' }, { value: 'member', label: 'my-MEMBER' },
  { value: 'why', label: 'ทำไมเลือกเรา (หน้าแรก)' },
];

export const PAGES = [
  { value: 'home', label: 'หน้าหลัก' },
  { value: 'models', label: 'รุ่นรถ' },
  { value: 'commercial', label: 'รถเพื่อการพาณิชย์' },
  { value: 'promotions', label: 'โปรโมชั่น' },
  { value: 'community', label: 'Community' },
  { value: 'activities', label: 'กิจกรรม' },
  { value: 'why', label: 'ทำไมต้องเรา' },
  { value: 'happy-whale', label: 'Happy Whale' },
  { value: 'about', label: 'เกี่ยวกับเรา' },
  { value: 'contact', label: 'ติดต่อเรา' },
  { value: 'test-drive', label: 'จองทดลองขับ' },
  { value: 'live', label: 'เปิดตัวรุ่นใหม่ (ไลฟ์)' },
  { value: 'my-member', label: 'my-MEMBER' },
];

export const ICONS = [
  ['car', 'รถเก๋ง/กระบะ'], ['pickup', 'กระบะ'], ['suv', 'SUV'], ['truck', 'รถบรรทุก'], ['dump-truck', 'รถดัมพ์'],
  ['tractor', 'รถหัวลาก'], ['bus', 'รถบัส'], ['crane', 'รถเครน'], ['tag', 'ป้ายราคา'], ['wrench', 'ประแจ'],
  ['settings', 'เฟือง'], ['map-pin', 'หมุดแผนที่'], ['phone', 'โทรศัพท์'], ['message', 'แชต'], ['calendar', 'ปฏิทิน'],
  ['user', 'คน'], ['users', 'กลุ่มคน'], ['user-check', 'คน + เครื่องหมายถูก'], ['headset', 'หูฟัง'], ['handshake', 'จับมือ'],
  ['heart', 'หัวใจ'], ['shield', 'โล่'], ['star', 'ดาว'], ['trophy', 'ถ้วยรางวัล'], ['leaf', 'ใบไม้'],
  ['banknote', 'ธนบัตร'], ['package', 'กล่อง/อะไหล่'], ['sos', 'ฉุกเฉิน'], ['clipboard', 'คลิปบอร์ด'], ['hammer', 'ค้อน'],
  ['briefcase', 'กระเป๋าธุรกิจ'], ['sparkles', 'ประกาย'], ['check', 'เครื่องหมายถูก'],
].map(([value, label]) => ({ value, label }));

export const HIGHLIGHT_GROUPS = [
  { value: 'home_quick', label: 'หน้าหลัก: ทางลัด 4 ปุ่ม' },
  { value: 'models_trust', label: 'รุ่นรถ: แถบจุดเด่นด้านล่าง' },
  { value: 'whale_help', label: 'รุ่นรถ: รายการในกล่อง Happy Whale' },
  { value: 'commercial_why', label: 'รถพาณิชย์: ทำไมต้อง IKS' },
  { value: 'service_badges', label: 'บริการ: จุดเด่นใต้แบนเนอร์' },
  { value: 'whale_values', label: 'Happy Whale: คุณค่า' },
  { value: 'whale_care', label: 'Happy Whale: ดูแลทุกช่วง' },
  { value: 'about_stats', label: 'เกี่ยวกับเรา: ตัวเลขสถิติ' },
  { value: 'company_dna', label: 'เกี่ยวกับเรา: DNA องค์กร' },
  { value: 'contact_features', label: 'ติดต่อเรา: จุดเด่นใต้แบนเนอร์' },
];

const slugHelp = 'ใช้ในลิงก์ เป็น a-z ตัวเลข และขีด (-) เช่น d-max-hi-lander · เว้นว่างให้ระบบตั้งให้';

export const ENTITIES: Entity[] = [
  {
    key: 'hero', table: 'hero_slides', label: 'แบนเนอร์หลัก (Hero)', single: 'แบนเนอร์', titleField: 'title', subtitleField: 'highlight',
    imageField: 'image_desktop', canCreate: true, canDelete: true,
    scope: { field: 'page_slug', label: 'หน้า', options: PAGES },
    hint: 'ถ้ามีหลายสไลด์ในหน้าเดียวกัน จะสลับให้อัตโนมัติทุก 7 วินาที',
    fields: [
      { name: 'page_slug', label: 'แสดงในหน้า', type: 'select', options: PAGES, required: true },
      { name: 'eyebrow', label: 'ข้อความเล็กเหนือหัวข้อ', type: 'text', max: 40 },
      { name: 'title', label: 'หัวข้อใหญ่', type: 'text', max: 60, required: true },
      { name: 'highlight', label: 'บรรทัดที่สอง (สี copper)', type: 'text', max: 60 },
      { name: 'subtitle', label: 'ข้อความรอง', type: 'text', max: 80 },
      { name: 'body', label: 'คำอธิบาย', type: 'textarea', max: 220, wide: true },
      { name: 'image_desktop', label: 'รูปสำหรับคอม', type: 'image', slot: 'hero_desktop' },
      { name: 'image_mobile', label: 'รูปสำหรับมือถือ', type: 'image', slot: 'hero_mobile' },
      { name: 'image_alt', label: 'คำอธิบายรูป (สำหรับ Google/ผู้พิการทางสายตา)', type: 'text', max: 120, wide: true },
      { name: 'cta1_label', label: 'ปุ่มที่ 1: ข้อความ', type: 'text', max: 30 },
      { name: 'cta1_url', label: 'ปุ่มที่ 1: ลิงก์', type: 'url' },
      { name: 'cta2_label', label: 'ปุ่มที่ 2: ข้อความ', type: 'text', max: 30 },
      { name: 'cta2_url', label: 'ปุ่มที่ 2: ลิงก์', type: 'url' },
      { name: 'starts_at', label: 'เริ่มแสดง (เว้นว่าง = ทันที)', type: 'datetime' },
      { name: 'ends_at', label: 'หยุดแสดง (เว้นว่าง = ไม่มีกำหนด)', type: 'datetime' },
    ],
  },
  {
    key: 'sections', table: 'page_sections', label: 'ส่วนต่างๆ ของหน้า', single: 'ส่วนของหน้า', titleField: 'label', subtitleField: 'title',
    scope: { field: 'page_slug', label: 'หน้า', options: PAGES },
    hint: 'เปิด/ปิด และเรียงลำดับส่วนต่างๆ ของหน้าได้ หัวข้อที่เว้นว่างจะใช้ค่าเริ่มต้น',
    fields: [
      { name: 'title', label: 'หัวข้อ', type: 'text', max: 80 },
      { name: 'subtitle', label: 'หัวข้อรอง', type: 'text', max: 160 },
      { name: 'body', label: 'เนื้อหา', type: 'textarea', max: 2000, wide: true },
      { name: 'cta_label', label: 'ปุ่ม: ข้อความ', type: 'text', max: 30 },
      { name: 'cta_url', label: 'ปุ่ม: ลิงก์', type: 'url' },
      { name: 'image', label: 'รูป (ถ้าส่วนนี้มีรูป)', type: 'image', slot: 'section_banner' },
      { name: 'video_url', label: 'วิดีโอ (ถ้าส่วนนี้มีคลิป)', type: 'text', max: 500, wide: true,
        help: 'ลิงก์ Facebook / YouTube หรือไฟล์บนเว็บ เช่น /media/videos/xxx.mp4 · ส่วน "คลิปแนะนำ" หน้า Happy Whale: รูปด้านบนใช้เป็นภาพปกคลิป' },
    ],
  },
  {
    key: 'vehicles', table: 'vehicles', label: 'รุ่นรถ', single: 'รุ่นรถ', titleField: 'name', subtitleField: 'tagline',
    imageField: 'image_card', canCreate: true, canDelete: true,
    fields: [
      { name: 'name', label: 'ชื่อรุ่น', type: 'text', max: 80, required: true },
      { name: 'slug', label: 'slug (ลิงก์)', type: 'slug', help: slugHelp },
      { name: 'category_id', label: 'กลุ่มรุ่นรถ', type: 'ref', ref: { table: 'vehicle_categories', label: 'name' }, help: 'เช่น รถเพื่อการพาณิชย์, Space Cab, Cab4, V-Cross, X-Series, MU-X' },
      { name: 'series', label: 'ซีรีส์ (เช่น D-MAX)', type: 'text', max: 40 },
      { name: 'tagline', label: 'คำโปรย', type: 'text', max: 80 },
      { name: 'badge', label: 'ป้ายบนรูป (เช่น รุ่นพิเศษ)', type: 'text', max: 30 },
      { name: 'price_from', label: 'ราคาเริ่มต้น (บาท)', type: 'number', help: 'แก้ราคาแต่ละรุ่นย่อยได้ที่เมนู "รุ่นย่อยและราคา"' },
      { name: 'price_note', label: 'หมายเหตุราคา', type: 'text', max: 120 },
      { name: 'capacity_label', label: 'น้ำหนักบรรทุก (รถพาณิชย์)', type: 'text', max: 40 },
      { name: 'is_featured', label: 'แสดงใน "รุ่นรถยอดนิยม"', type: 'bool' },
      { name: 'description', label: 'รายละเอียด', type: 'textarea', max: 3000, wide: true },
      { name: 'image_card', label: 'รูปการ์ด', type: 'image', slot: 'vehicle_card' },
      { name: 'image_cutout', label: 'รูปรถตัดพื้น', type: 'image', slot: 'vehicle_cutout' },
      { name: 'colors', label: 'สีที่มี', type: 'colors', wide: true },
      { name: 'specs', label: 'ข้อมูลจำเพาะ', type: 'specs', wide: true },
      { name: 'gallery', label: 'แกลเลอรี', type: 'images', slot: 'vehicle_gallery', wide: true },
    ],
  },
  {
    key: 'vehicle-categories', table: 'vehicle_categories', label: 'หมวดรถ', single: 'หมวดรถ', titleField: 'name', subtitleField: 'subtitle',
    imageField: 'image', canCreate: true, canDelete: true,
    scope: { field: 'segment', label: 'กลุ่ม', options: SEGMENTS },
    fields: [
      { name: 'name', label: 'ชื่อหมวด', type: 'text', max: 60, required: true },
      { name: 'slug', label: 'slug', type: 'slug', help: slugHelp },
      { name: 'segment', label: 'กลุ่ม', type: 'select', required: true, options: SEGMENTS },
      { name: 'subtitle', label: 'คำอธิบายสั้น', type: 'text', max: 80 },
      { name: 'icon', label: 'ไอคอน', type: 'icon' },
      { name: 'image', label: 'รูป', type: 'image', slot: 'vehicle_category' },
    ],
  },
  {
    key: 'campaigns', table: 'campaigns', label: 'เปิดตัวรุ่นใหม่ / ไลฟ์', single: 'แคมเปญ', titleField: 'title', subtitleField: 'date_text',
    imageField: 'image_desktop', canCreate: true, canDelete: true,
    hint: 'เว็บใช้แคมเปญได้ทีละอันเดียว = อันบนสุดที่ "เผยแพร่" และ "แสดง" อยู่ (ไม่ต้องสร้างใหม่ทุกครั้ง แก้อันเดิมได้) · ติ๊ก "แสดงเป็นเมนูบนหัวเว็บ" แท็บรุ่นใหม่ถึงจะขึ้น · ใส่ลิงก์ไลฟ์ Facebook (วางลิงก์จากปุ่มแชร์ได้) + เวลาเริ่ม แล้วจอไลฟ์ขึ้นเอง · ลองก่อนได้ที่เมนู "ทดสอบลิงก์ไลฟ์" · แชร์ลิงก์แยกช่องทาง: /live?src=fb , ?src=tiktok , ?src=line , ?src=qr',
    fields: [
      { name: 'title', label: 'หัวข้อใหญ่', type: 'text', max: 80, required: true },
      { name: 'highlight', label: 'บรรทัดที่สอง (สี copper)', type: 'text', max: 80 },
      { name: 'eyebrow', label: 'ข้อความเล็กด้านบน', type: 'text', max: 60 },
      { name: 'body', label: 'คำอธิบาย', type: 'textarea', max: 500, wide: true },
      { name: 'date_text', label: 'วันที่ (ข้อความ เช่น 22 ตุลาคม 2569)', type: 'text', max: 60 },
      { name: 'launch_at', label: 'วันเวลาเริ่มไลฟ์ (ใช้นับถอยหลัง)', type: 'datetime', help: 'เว้นว่างได้ถ้ายังไม่ทราบเวลา' },
      { name: 'live_hours', label: 'ไลฟ์ยาวประมาณกี่ชั่วโมง', type: 'number', required: true, help: 'เลยเวลานี้ หน้าเว็บเปลี่ยนเป็น "ชมย้อนหลัง" เอง' },
      { name: 'mode', label: 'สถานะหน้า', type: 'select', required: true, options: [
        { value: 'auto', label: 'อัตโนมัติตามเวลา' }, { value: 'upcoming', label: 'บังคับ: ก่อนไลฟ์' },
        { value: 'live', label: 'บังคับ: กำลังไลฟ์' }, { value: 'ended', label: 'บังคับ: จบแล้ว (ย้อนหลัง)' },
      ] },
      { name: 'teaser_url', label: 'คลิปทีเซอร์ (ก่อนไลฟ์)', type: 'url', help: 'ลิงก์ Facebook / YouTube / TikTok หรือไฟล์บนเว็บเรา เช่น /media/videos/teaser.mp4 (ไฟล์ของเราเล่นเองอัตโนมัติ)' },
      { name: 'video_poster', label: 'ภาพปกวิดีโอ', type: 'image', slot: 'hero_desktop' },
      { name: 'live_url', label: 'ลิงก์ไลฟ์', type: 'url', help: 'Facebook Live (เพจสาธารณะ วางลิงก์จากปุ่มแชร์ได้) หรือ YouTube Live · TikTok LIVE ฝังในเว็บไม่ได้ · ทดสอบลิงก์ก่อนได้ที่เมนู "ทดสอบลิงก์ไลฟ์"' },
      { name: 'replay_url', label: 'ลิงก์คลิปย้อนหลัง', type: 'url', help: 'เว้นว่าง = ใช้ลิงก์ไลฟ์' },
      { name: 'points', label: 'จุดเด่นสั้นๆ', type: 'strings', wide: true },
      { name: 'offer_title', label: 'ข้อเสนอพิเศษ: หัวข้อ', type: 'text', max: 80 },
      { name: 'offer_body', label: 'ข้อเสนอพิเศษ: รายละเอียด', type: 'textarea', max: 500, wide: true },
      { name: 'form_title', label: 'หัวข้อฟอร์ม (ก่อนไลฟ์)', type: 'text', max: 80 },
      { name: 'nav_label', label: 'ชื่อเมนูบนหัวเว็บ', type: 'text', max: 20, required: true },
      { name: 'show_in_nav', label: 'แสดงเป็นเมนูบนหัวเว็บ + แถบประกาศ', type: 'bool' },
      { name: 'show_on_home', label: 'แสดงบนสุดของหน้าแรก (ทีเซอร์/ไลฟ์)', type: 'bool' },
      { name: 'slug', label: 'รหัสแคมเปญ (ใช้แยก lead)', type: 'slug' },
      { name: 'image_desktop', label: 'ภาพแบนเนอร์ (คอม)', type: 'image', slot: 'hero_desktop' },
      { name: 'image_mobile', label: 'ภาพแบนเนอร์ (มือถือ)', type: 'image', slot: 'hero_mobile' },
    ],
  },
  {
    key: 'vehicle-grades', table: 'vehicle_grades', label: 'รุ่นย่อยและราคา', single: 'รุ่นย่อย', titleField: 'name', subtitleField: 'price',
    canCreate: true, canDelete: true,
    orderBy: '(select v.sort_order from public.vehicles v where v.id = vehicle_id), sort_order',
    hint: 'ราคาแนะนำแต่ละรุ่นย่อย แสดงในตารางราคาหน้ารายละเอียดรุ่นรถ เว้นราคาว่าง = แสดง "สอบถามราคา"',
    fields: [
      { name: 'vehicle_id', label: 'รุ่นรถ', type: 'ref', required: true, ref: { table: 'vehicles', label: 'name' } },
      { name: 'name', label: 'ชื่อรุ่นย่อย', type: 'text', max: 80, required: true },
      { name: 'price', label: 'ราคาแนะนำ (บาท)', type: 'number' },
      { name: 'engine', label: 'เครื่องยนต์', type: 'text', max: 80 },
      { name: 'power', label: 'แรงม้า', type: 'text', max: 40 },
      { name: 'torque', label: 'แรงบิด', type: 'text', max: 60 },
      { name: 'transmission', label: 'ระบบเกียร์', type: 'text', max: 40 },
      { name: 'drive', label: 'ระบบขับเคลื่อน', type: 'text', max: 20 },
      { name: 'wheels', label: 'ล้อ', type: 'text', max: 60 },
      { name: 'screen', label: 'จอ', type: 'text', max: 40 },
      { name: 'features', label: 'จุดเด่น', type: 'text', max: 300, wide: true },
    ],
  },
  {
    key: 'faqs', table: 'faqs', label: 'คำถามที่พบบ่อย', single: 'คำถาม', titleField: 'question', subtitleField: 'group_key',
    canCreate: true, canDelete: true,
    scope: { field: 'group_key', label: 'หมวด', options: FAQ_GROUPS },
    hint: 'คำถาม-คำตอบช่วยให้ Google และ AI หยิบข้อมูลของเราไปตอบลูกค้า เขียนให้ตรง ชัด มีชื่อรุ่น/สาขา/ตัวเลขจริง',
    fields: [
      { name: 'group_key', label: 'หมวด', type: 'select', required: true, options: FAQ_GROUPS },
      { name: 'question', label: 'คำถาม', type: 'text', max: 200, required: true, wide: true },
      { name: 'answer', label: 'คำตอบ', type: 'textarea', max: 2000, required: true },
    ],
  },
  {
    key: 'body-types', table: 'body_types', label: 'ตัวถังและการดัดแปลง', single: 'ตัวถัง', titleField: 'name', subtitleField: 'name_en',
    imageField: 'image', canCreate: true, canDelete: true,
    fields: [
      { name: 'name', label: 'ชื่อ', type: 'text', max: 60, required: true },
      { name: 'name_en', label: 'ชื่ออังกฤษ', type: 'text', max: 60 },
      { name: 'description', label: 'คำอธิบาย', type: 'textarea', max: 500, wide: true },
      { name: 'image', label: 'รูป', type: 'image', slot: 'body_type' },
    ],
  },
  {
    key: 'industries', table: 'industries', label: 'ประเภทธุรกิจ', single: 'ประเภทธุรกิจ', titleField: 'name', subtitleField: 'subtitle',
    imageField: 'image', canCreate: true, canDelete: true,
    fields: [
      { name: 'name', label: 'ชื่อ', type: 'text', max: 40, required: true },
      { name: 'subtitle', label: 'คำอธิบายสั้น', type: 'text', max: 60 },
      { name: 'url', label: 'ลิงก์เมื่อกด (เว้นว่าง = ฟอร์มติดต่อ)', type: 'url' },
      { name: 'image', label: 'รูปหลัก (สไลด์แรก)', type: 'image', slot: 'industry' },
      { name: 'gallery', label: 'รูปเพิ่มเติม (สไลด์ถัดไป)', type: 'images', slot: 'industry', wide: true },
      { name: 'slug', label: 'ลิงก์หน้ารายละเอียด (slug)', type: 'slug', help: 'เช่น cold-chain → หน้าเว็บ /commercial/cold-chain · เว้นว่าง = ไม่มีหน้ารายละเอียด' },
      { name: 'headline', label: 'หัวข้อหน้ารายละเอียด (คำที่ลูกค้าค้นหา)', type: 'text', max: 80, wide: true, help: 'เช่น D-MAX ต่อตู้เย็น ตู้ห้องเย็น อีซูซุ — ใช้เป็นชื่อหน้าใน Google ด้วย' },
      { name: 'models_text', label: 'รุ่นที่เหมาะ', type: 'text', max: 200, wide: true },
      { name: 'description', label: 'รายละเอียด', type: 'textarea', max: 3000, wide: true, help: 'บรรทัดที่ขึ้นต้นด้วย - จะแสดงเป็นข้อ ๆ · ข้อความหน้าเครื่องหมาย : เป็นตัวหนา' },
    ],
  },
  {
    key: 'promotions', table: 'promotions', label: 'โปรโมชั่น', single: 'โปรโมชั่น', titleField: 'title', subtitleField: 'value_text',
    imageField: 'image', canCreate: true, canDelete: true,
    hint: 'โปรที่เลยวันหยุดแสดงจะถูกซ่อนจากหน้าเว็บให้อัตโนมัติ',
    fields: [
      { name: 'title', label: 'ชื่อโปร', type: 'text', max: 80, required: true },
      { name: 'slug', label: 'slug', type: 'slug', help: slugHelp },
      { name: 'category_id', label: 'หมวดโปร', type: 'ref', ref: { table: 'promotion_categories', label: 'name' } },
      { name: 'vehicle_id', label: 'รุ่นรถที่เกี่ยวข้อง', type: 'ref', ref: { table: 'vehicles', label: 'name' } },
      { name: 'subtitle', label: 'คำโปรย', type: 'text', max: 120 },
      { name: 'badge', label: 'ป้ายสีแดงบนรูป', type: 'text', max: 30 },
      { name: 'value_label', label: 'ข้อความเหนือตัวเลข (เช่น ดอกเบี้ยเริ่มต้น)', type: 'text', max: 40 },
      { name: 'value_text', label: 'ตัวเลขเด่น (เช่น 1.79%)', type: 'text', max: 30 },
      { name: 'is_featured', label: 'โปรเด่น (แสดงหน้าหลัก)', type: 'bool' },
      { name: 'bullets', label: 'สิทธิประโยชน์', type: 'strings', wide: true },
      { name: 'terms', label: 'เงื่อนไข', type: 'textarea', max: 3000, wide: true },
      { name: 'image', label: 'รูป', type: 'image', slot: 'promotion' },
      { name: 'starts_at', label: 'เริ่มแสดง', type: 'datetime' },
      { name: 'ends_at', label: 'หยุดแสดง', type: 'datetime' },
    ],
  },
  {
    key: 'promotion-categories', table: 'promotion_categories', label: 'หมวดโปรโมชั่น', single: 'หมวดโปร', titleField: 'name', subtitleField: 'subtitle',
    canCreate: true, canDelete: true,
    fields: [
      { name: 'name', label: 'ชื่อหมวด', type: 'text', max: 40, required: true },
      { name: 'slug', label: 'slug', type: 'slug', help: slugHelp },
      { name: 'subtitle', label: 'คำอธิบายสั้น', type: 'text', max: 60 },
      { name: 'icon', label: 'ไอคอน', type: 'icon' },
    ],
  },
  {
    key: 'services', table: 'services', label: 'บริการ', single: 'บริการ', titleField: 'title', subtitleField: 'subtitle',
    imageField: 'image', canCreate: true, canDelete: true,
    scope: { field: 'group_key', label: 'กลุ่ม', options: [{ value: 'general', label: 'หน้าบริการ' }, { value: 'commercial', label: 'หน้ารถพาณิชย์' }] },
    fields: [
      { name: 'title', label: 'ชื่อบริการ', type: 'text', max: 60, required: true },
      { name: 'group_key', label: 'แสดงในหน้า', type: 'select', required: true, options: [{ value: 'general', label: 'หน้าบริการ' }, { value: 'commercial', label: 'หน้ารถพาณิชย์' }] },
      { name: 'subtitle', label: 'คำอธิบายสั้น', type: 'text', max: 80 },
      { name: 'icon', label: 'ไอคอน', type: 'icon' },
      { name: 'is_quick_link', label: 'แสดงในแถบทางลัด', type: 'bool' },
      { name: 'description', label: 'รายละเอียด', type: 'textarea', max: 1000, wide: true },
      { name: 'cta_label', label: 'ปุ่ม: ข้อความ', type: 'text', max: 30 },
      { name: 'cta_url', label: 'ปุ่ม: ลิงก์', type: 'url' },
      { name: 'image', label: 'รูป', type: 'image', slot: 'service' },
    ],
  },
  {
    key: 'highlights', table: 'highlights', label: 'ไอคอนและจุดเด่น', single: 'รายการ', titleField: 'title', subtitleField: 'subtitle',
    canCreate: true, canDelete: true,
    scope: { field: 'group_key', label: 'ตำแหน่ง', options: HIGHLIGHT_GROUPS },
    hint: 'รายการไอคอน + หัวข้อสั้นๆ ที่ใช้หลายจุดในเว็บ เลือกตำแหน่งด้านบนเพื่อดูแต่ละชุด',
    fields: [
      { name: 'group_key', label: 'ตำแหน่ง', type: 'select', required: true, options: HIGHLIGHT_GROUPS },
      { name: 'title', label: 'หัวข้อ (ตัวเลขสถิติใส่ที่นี่)', type: 'text', max: 60, required: true },
      { name: 'subtitle', label: 'คำอธิบาย', type: 'text', max: 120 },
      { name: 'icon', label: 'ไอคอน', type: 'icon' },
      { name: 'url', label: 'ลิงก์ (เฉพาะทางลัด)', type: 'url' },
    ],
  },
  {
    key: 'branches', table: 'branches', label: 'สาขา', single: 'สาขา', titleField: 'name', subtitleField: 'address',
    imageField: 'image', canCreate: true, canDelete: true,
    fields: [
      { name: 'name', label: 'ชื่อสาขา', type: 'text', max: 60, required: true },
      { name: 'code', label: 'รหัสสาขา (A-Z เช่น BN)', type: 'text', max: 6, required: true },
      { name: 'is_headquarters', label: 'สำนักงานใหญ่ (แสดงเป็นสาขาแรกในแผนที่หน้าติดต่อ)', type: 'bool' },
      { name: '_place', label: 'เชื่อมสาขากับ Google Maps', type: 'placefinder', wide: true },
      { name: 'address', label: 'ที่อยู่', type: 'textarea', max: 300, wide: true },
      { name: 'nearby', label: 'พื้นที่ใกล้เคียง / จุดสังเกต (คั่นด้วย ,)', type: 'text', max: 300, wide: true,
        help: 'ใช้ให้ Google และ AI จับคู่คำค้น เช่น สาขาเกษตร: รัชโยธิน, ม.เกษตรศาสตร์, เสนานิคม · ชื่อแรกจะอยู่ในชื่อหน้าใน Google' },
      { name: 'district', label: 'เขต/อำเภอ', type: 'text', max: 60 },
      { name: 'province', label: 'จังหวัด', type: 'text', max: 60 },
      { name: 'postcode', label: 'รหัสไปรษณีย์', type: 'text', max: 5 },
      { name: 'phone', label: 'เบอร์โทร', type: 'text', max: 40 },
      { name: 'line_id', label: 'LINE ID', type: 'text', max: 60 },
      { name: 'line_url', label: 'ลิงก์ LINE', type: 'url' },
      { name: 'email', label: 'อีเมล', type: 'text', max: 120 },
      { name: 'google_place_id', label: 'Google Place ID', type: 'text', max: 300, help: 'เติมให้อัตโนมัติจากช่องค้นหาด้านบน · ใช้ดึงคะแนนและรีวิว' },
      { name: 'map_url', label: 'ลิงก์ Google Maps', type: 'url', help: 'เติมให้อัตโนมัติ หรือ Google Maps → แชร์ → คัดลอกลิงก์' },
      { name: 'latitude', label: 'ละติจูด', type: 'number', help: 'เติมให้อัตโนมัติ หรือคลิกขวาที่หมุดใน Google Maps → ตัวเลขแรก' },
      { name: 'longitude', label: 'ลองจิจูด', type: 'number', help: 'ตัวเลขที่สอง' },
      { name: 'has_showroom', label: 'มีโชว์รูม', type: 'bool' },
      { name: 'has_service', label: 'มีศูนย์บริการ', type: 'bool' },
      { name: 'has_parts', label: 'มีอะไหล่', type: 'bool' },
      { name: 'hours_showroom', label: 'เวลาโชว์รูม', type: 'text', max: 80 },
      { name: 'hours_service', label: 'เวลาศูนย์บริการ', type: 'text', max: 80 },
      { name: 'hours_parts', label: 'เวลาอะไหล่', type: 'text', max: 80 },
      { name: 'image', label: 'รูปสาขา', type: 'image', slot: 'branch' },
    ],
  },
  {
    key: 'staff', table: 'staff', label: 'ทีมที่ปรึกษาการขาย', single: 'พนักงาน', titleField: 'full_name', subtitleField: 'position',
    imageField: 'photo', canCreate: true, canDelete: true, orderBy: 'sort_order, full_name',
    hint: 'ต้องได้รับความยินยอมจากพนักงานก่อนลงรูป ชื่อ และเบอร์บนเว็บ (PDPA) ระบบจะไม่ให้เผยแพร่ถ้ายังไม่ใส่วันที่ยินยอม',
    fields: [
      { name: 'full_name', label: 'ชื่อ-นามสกุล', type: 'text', max: 80, required: true },
      { name: 'nickname', label: 'ชื่อเล่น', type: 'text', max: 30 },
      { name: 'position', label: 'ตำแหน่ง', type: 'text', max: 60 },
      { name: 'branch_id', label: 'สาขา', type: 'ref', ref: { table: 'branches', label: 'name' } },
      { name: 'phone', label: 'เบอร์โทร', type: 'text', max: 40 },
      { name: 'line_id', label: 'LINE ID', type: 'text', max: 60 },
      { name: 'consent_at', label: 'วันที่พนักงานยินยอม (PDPA)', type: 'date', required: false },
      { name: 'photo', label: 'รูป', type: 'image', slot: 'staff' },
    ],
  },
  {
    key: 'areas', table: 'areas', label: 'หน้าพื้นที่ (SEO)', single: 'หน้าพื้นที่', titleField: 'name', subtitleField: 'headline',
    canCreate: true, canDelete: true,
    hint: 'หน้า /areas/<slug> สำหรับคำค้น เช่น "อีซูซุ สมุทรปราการ" · ใส่รหัสสาขาที่ใกล้พื้นที่นั้น (BN, SR, BST, KS)',
    fields: [
      { name: 'name', label: 'ชื่อพื้นที่ (เช่น สมุทรปราการ)', type: 'text', max: 60, required: true },
      { name: 'slug', label: 'ลิงก์ (slug)', type: 'slug', help: 'เช่น samut-prakan → /areas/samut-prakan' },
      { name: 'headline', label: 'หัวข้อหน้า / ชื่อใน Google', type: 'text', max: 80, wide: true },
      { name: 'intro', label: 'คำอธิบาย', type: 'textarea', max: 2000, wide: true },
      { name: 'districts', label: 'เขต / ย่าน / ถนนที่ครอบคลุม (คั่นด้วย ,)', type: 'text', max: 400, wide: true },
      { name: 'branch_codes', label: 'สาขาที่ใกล้ (รหัส คั่นด้วย , เช่น BN,SR)', type: 'text', max: 60 },
    ],
  },
  {
    key: 'gallery', table: 'gallery_images', label: 'แกลเลอรีรูป', single: 'รูป', titleField: 'alt', subtitleField: 'group_key',
    imageField: 'image', canCreate: true, canDelete: true,
    scope: { field: 'group_key', label: 'ชุดรูป', options: GALLERY_GROUPS },
    hint: 'รูปในหน้า 2.2 Bi-Turbo (สไลด์โชว์ด้านบน + แกลเลอรี) · เรียงตามลำดับ · ซ่อนรูปที่ไม่ต้องการได้โดยไม่ต้องลบ',
    fields: [
      { name: 'group_key', label: 'ชุดรูป', type: 'select', options: GALLERY_GROUPS, required: true },
      { name: 'image', label: 'รูป', type: 'image', slot: 'gallery', required: true },
      { name: 'alt', label: 'คำอธิบายรูป (ช่วย SEO เช่น อีซูซุ ดีแมคซ์ วีครอส 2.2 ไบเทอร์โบ สีขาว)', type: 'text', max: 160, wide: true },
    ],
  },
  {
    key: 'communities', table: 'communities', label: 'Community (คลับ)', single: 'คลับ', titleField: 'name', subtitleField: 'tagline',
    imageField: 'cover_image', canCreate: true, canDelete: true,
    hint: 'แต่ละคลับมีหน้าของตัวเองที่ /community/<slug> · โพสต์รูปและข้อความของคลับที่เมนู "โพสต์ Community"',
    fields: [
      { name: 'name', label: 'ชื่อคลับ', type: 'text', max: 60, required: true },
      { name: 'slug', label: 'ลิงก์ (slug)', type: 'slug', help: 'ภาษาอังกฤษตัวเล็ก เช่น songsuk-club → /community/songsuk-club' },
      { name: 'tagline', label: 'คำโปรยสั้น', type: 'text', max: 160, wide: true },
      { name: 'description', label: 'เกี่ยวกับคลับ', type: 'textarea', max: 5000, wide: true, help: 'ขึ้นบรรทัดด้วย - เพื่อทำเป็นรายการ' },
      { name: 'cover_image', label: 'รูปปก', type: 'image', slot: 'community_cover' },
      { name: 'logo', label: 'โลโก้คลับ', type: 'image', slot: 'community_logo' },
      { name: 'gallery', label: 'รูปบรรยากาศคลับ (เลื่อนดูได้หลายรูป)', type: 'images', slot: 'activity_gallery', wide: true },
      { name: 'join_label', label: 'ข้อความปุ่มสมัคร', type: 'text', max: 40, help: 'เช่น สนใจร่วมคลับ / เข้ากลุ่ม LINE' },
      { name: 'join_url', label: 'ลิงก์ปุ่มสมัคร', type: 'text', max: 500, wide: true, help: 'ลิงก์กลุ่ม LINE / เพจ Facebook · เว้นว่าง = ไปฟอร์มติดต่อเรา' },
    ],
  },
  {
    key: 'community-posts', table: 'community_posts', label: 'โพสต์ Community', single: 'โพสต์', titleField: 'title', subtitleField: 'post_date',
    canCreate: true, canDelete: true,
    orderBy: 'post_date desc nulls last, created_at desc',
    hint: 'โพสต์รูป + ข้อความ ลงหน้าคลับ เรียงจากวันที่ล่าสุด',
    fields: [
      { name: 'community_id', label: 'คลับ', type: 'ref', required: true, ref: { table: 'communities', label: 'name' } },
      { name: 'title', label: 'หัวข้อ', type: 'text', max: 120, required: true },
      { name: 'post_date', label: 'วันที่', type: 'date' },
      { name: 'body', label: 'ข้อความ', type: 'textarea', max: 5000, wide: true },
      { name: 'images', label: 'รูป (เลือกหลายรูปพร้อมกันได้)', type: 'images', slot: 'community_post', wide: true },
      { name: 'video_url', label: 'คลิป (ถ้ามี)', type: 'text', max: 500, wide: true, help: 'ลิงก์ Facebook / YouTube / TikTok' },
    ],
  },
  {
    key: 'activities', table: 'activities', label: 'กิจกรรม', single: 'กิจกรรม', titleField: 'title', subtitleField: 'summary',
    imageField: 'cover_image', canCreate: true, canDelete: true,
    fields: [
      { name: 'title', label: 'ชื่อกิจกรรม', type: 'text', max: 80, required: true },
      { name: 'slug', label: 'slug', type: 'slug', help: slugHelp },
      { name: 'event_date', label: 'วันที่จัด', type: 'date' },
      { name: 'summary', label: 'สรุปสั้น', type: 'text', max: 200, wide: true },
      { name: 'body', label: 'รายละเอียด', type: 'textarea', max: 10000, wide: true },
      { name: 'cover_image', label: 'รูปปก', type: 'image', slot: 'activity_cover' },
      { name: 'gallery', label: 'รูปสไลด์ (เลื่อนดูได้หลายรูป)', type: 'images', slot: 'activity_gallery', wide: true },
      { name: 'video_url', label: 'คลิป (ถ้ามี)', type: 'text', max: 500, wide: true,
        help: 'ลิงก์ Facebook / YouTube / TikTok หรือไฟล์บนเว็บ /media/videos/xxx.mp4 · ถ้าใส่คลิป จะแสดงคลิปแทนสไลด์รูป (รูปปกใช้เป็นภาพปกคลิป)' },
    ],
  },
  {
    key: 'timeline', table: 'timeline_events', label: 'ไทม์ไลน์บริษัท', single: 'เหตุการณ์', titleField: 'title', subtitleField: 'year',
    imageField: 'image', canCreate: true, canDelete: true, orderBy: 'year, sort_order',
    fields: [
      { name: 'year', label: 'ปี ค.ศ. (หน้าเว็บแสดงเป็น พ.ศ. ให้เอง)', type: 'number', required: true },
      { name: 'title', label: 'หัวข้อ', type: 'text', max: 60, required: true },
      { name: 'description', label: 'คำอธิบาย', type: 'text', max: 200, wide: true },
      { name: 'image', label: 'รูป', type: 'image', slot: 'timeline' },
    ],
  },
];

export const ENTITY_MAP = Object.fromEntries(ENTITIES.map((e) => [e.key, e]));
export const ENTITY_BY_TABLE = Object.fromEntries(ENTITIES.map((e) => [e.table, e]));

export const STATUS_LABEL: Record<string, string> = { sample: 'ตัวอย่าง', draft: 'ร่าง', published: 'เผยแพร่' };

export const LEAD_TYPES: Record<string, string> = {
  quote: 'ขอใบเสนอราคา', test_drive: 'ทดลองขับ', service_booking: 'นัดเข้าศูนย์', contact: 'สอบถามทั่วไป', commercial: 'รถพาณิชย์', launch: 'เปิดตัวรุ่นใหม่',
};
export const LEAD_STATUS: Record<string, string> = {
  new: 'ใหม่', contacted: 'ติดต่อแล้ว', qualified: 'มีแนวโน้ม', closed: 'ปิดแล้ว', spam: 'สแปม',
};
