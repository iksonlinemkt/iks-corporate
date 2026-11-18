-- คำถามแบบที่ลูกค้าถาม Google / AI: "ซื้ออีซูซุที่ไหนดี" "บริการดีไหม" "เงื่อนไขเป็นอย่างไร"
alter table public.faqs drop constraint if exists faqs_group_key_check;
alter table public.faqs add constraint faqs_group_key_check
  check (group_key in ('general', 'commercial', 'test_drive', 'service', 'member', 'why'));

insert into public.faqs (group_key, question, answer, status, sort_order)
select v.g, v.q, v.a, v.s::public.content_status, v.n
from (values
  ('why', 'ซื้อรถอีซูซุที่ไหนดี ในกรุงเทพฯ?',
   E'อีซูซุกรุงเทพเซลส์ เป็นผู้จำหน่ายรถอีซูซุตั้งแต่ พ.ศ. 2525 มี 4 สาขาในกรุงเทพฯ และสมุทรปราการ คือ บางนา ศรีนครินทร์ บางเสาธง และเกษตร ทุกสาขามีโชว์รูม ศูนย์บริการ และอะไหล่แท้ จึงซื้อรถและดูแลรถได้ที่เดียวกัน ดูรีวิวจากลูกค้าจริงบน Google Maps ได้ในหน้าข้อมูลแต่ละสาขา',
   'published', 1),
  ('why', 'ออกรถอีซูซุที่อีซูซุกรุงเทพเซลส์ มีโปรโมชั่นและเงื่อนไขอย่างไร?',
   E'โปรโมชั่น เงินดาวน์ ค่างวด และของแถม เปลี่ยนไปตามรุ่นและช่วงเวลา ดูข้อเสนอล่าสุดได้ที่หน้าโปรโมชั่น หรือกดขอใบเสนอราคา ทีมขายจะคำนวณดาวน์ ผ่อน และสิทธิพิเศษให้ตามรุ่นที่สนใจ',
   'published', 2),
  ('why', 'หลังซื้อรถแล้ว อีซูซุกรุงเทพเซลส์ดูแลอะไรบ้าง?',
   E'ทุกสาขามีศูนย์บริการ เช็กระยะ ซ่อมทั่วไป และอะไหล่แท้ จองนัดเข้าศูนย์ออนไลน์ได้ที่หน้าติดต่อเรา และสมัครสมาชิก my-MEMBER ฟรี เพื่อสะสมคะแนนทุกครั้งที่เข้าศูนย์ รับส่วนลดน้ำมันเครื่องและอะไหล่ตามระดับสมาชิก',
   'published', 3),
  ('why', 'ซื้อรถกระบะต่อตู้ / ต่อหลังคา จัดไฟแนนซ์รวมค่าอุปกรณ์ได้ไหม?',
   E'(รอข้อมูลจากบริษัท) ตอบเงื่อนไขการจัดไฟแนนซ์รวมค่าอุปกรณ์ และระยะเวลาต่ออุปกรณ์โดยประมาณ',
   'sample', 4),
  ('why', 'อีซูซุกรุงเทพเซลส์ ต่างจากที่อื่นอย่างไร?',
   E'(รอข้อมูลจากบริษัท) เช่น ทีมดูแลรถเพื่อการพาณิชย์โดยเฉพาะ ประสบการณ์ ความเร็วในการส่งมอบ บริการหลังการขาย',
   'sample', 5),
  ('why', 'นำรถคันเก่ามาเทิร์นได้ไหม?',
   E'(รอข้อมูลจากบริษัท) ตอบเงื่อนไขการเทิร์นรถ ประเมินราคาที่สาขาหรือออนไลน์',
   'sample', 6)
) as v(g, q, a, s, n)
where not exists (select 1 from public.faqs f where f.group_key = 'why');

-- หน้าแรก: ส่วน "ทำไมลูกค้าเลือกเรา" (ถาม-ตอบ) ก่อนรีวิว
insert into public.page_sections (page_slug, section_key, label, title, subtitle, status, sort_order)
select 'home', 'why_faq', 'ทำไมลูกค้าเลือกเรา (ถาม-ตอบ)', 'ทำไมลูกค้าเลือกอีซูซุกรุงเทพเซลส์',
       'คำถามที่ลูกค้าถามบ่อยก่อนตัดสินใจซื้อรถ', 'published',
       coalesce((select sort_order from public.page_sections where page_slug = 'home' and section_key = 'reviews'), 80) - 1
where not exists (select 1 from public.page_sections where page_slug = 'home' and section_key = 'why_faq');
