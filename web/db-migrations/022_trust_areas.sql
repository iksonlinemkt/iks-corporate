-- ความน่าเชื่อถือ (SSI อันดับ 1 · ช่วยเหลือฉุกเฉิน 24 ชม.) + หน้าพื้นที่ (อีซูซุ สมุทรปราการ / ปริมณฑล / กรุงเทพฯ / ชลบุรี) + หน้า "ทำไมต้องเรา"

-- 1) ข้อมูลความน่าเชื่อถือ (ตั้งค่าเว็บ → ข้อมูลบริษัท)
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('award_title',      'รางวัล/ผลงาน (หัวข้อสั้น)',       'company', 'ความพึงพอใจ SSI อันดับ 1', 'published', 6),
  ('award_detail',     'รางวัล/ผลงาน (รายละเอียด)',        'company', 'เขตกรุงเทพฯ และปริมณฑล', 'published', 7),
  ('emergency_service','บริการช่วยเหลือฉุกเฉิน',            'company', 'บริการช่วยเหลือฉุกเฉิน 24 ชั่วโมง', 'published', 8),
  ('phone_emergency',  'เบอร์ช่วยเหลือฉุกเฉิน 24 ชม.',     'contact', null, 'published', 18)
on conflict (key) do nothing;

-- 2) หน้าพื้นที่
create table if not exists public.areas (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name         text not null check (char_length(name) <= 60),
  headline     text check (char_length(headline) <= 80),
  intro        text check (char_length(intro) <= 2000),
  districts    text check (char_length(districts) <= 400),
  branch_codes text check (char_length(branch_codes) <= 60),
  status       public.content_status not null default 'draft',
  is_visible   boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references public.admin_users(id) on delete set null
);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'areas_touch') then
    create trigger areas_touch before update on public.areas for each row execute function public.touch_row();
    create trigger areas_audit after insert or update or delete on public.areas for each row execute function public.write_audit();
  end if;
end $$;
create or replace view public.published_areas as
  select * from public.areas where status = 'published' and is_visible;
grant select on public.published_areas to iks_web_public;
grant select, insert, update, delete on public.areas to iks_web_admin;

insert into public.areas (slug, name, headline, intro, districts, branch_codes, status, sort_order) values
  ('samut-prakan', 'สมุทรปราการ', 'อีซูซุ สมุทรปราการ โชว์รูมและศูนย์บริการใกล้คุณ',
   E'ลูกค้าในสมุทรปราการ เลือกใช้บริการอีซูซุกรุงเทพเซลส์ได้ที่สาขาบางนา ศรีนครินทร์ และบางเสาธง ครบทั้งโชว์รูมรถใหม่ ศูนย์บริการ อะไหล่แท้ และรถกระบะเพื่อการพาณิชย์พร้อมต่ออุปกรณ์',
   'บางพลี, เทพารักษ์, บางบ่อ, บางเสาธง, ศรีนครินทร์, สำโรง, บางนา-ตราด, เมืองสมุทรปราการ', 'BN,SR,BST', 'published', 1),
  ('vicinity', 'ปริมณฑล', 'อีซูซุ ปริมณฑล ซื้อรถและเข้าศูนย์ใกล้บ้าน',
   E'อีซูซุกรุงเทพเซลส์ดูแลลูกค้าทั้งกรุงเทพฯ และปริมณฑล 4 สาขา ลูกค้าฝั่งสมุทรปราการเลือกสาขาบางนา ศรีนครินทร์ หรือบางเสาธง ลูกค้าฝั่งนนทบุรีและปทุมธานีสะดวกที่สาขาเกษตร',
   'สมุทรปราการ, นนทบุรี, ปทุมธานี, สมุทรสาคร, นครปฐม', 'BN,SR,BST,KS', 'published', 2),
  ('bangkok', 'กรุงเทพฯ', 'อีซูซุ กรุงเทพ ตัวแทนจำหน่ายและศูนย์บริการ 4 สาขา',
   E'อีซูซุกรุงเทพเซลส์ ผู้จำหน่ายรถอีซูซุในกรุงเทพฯ ตั้งแต่ พ.ศ. 2525 มีโชว์รูม ศูนย์บริการ และอะไหล่ครบทุกสาขา ดูแลทั้งลูกค้าทั่วไปและรถเพื่อการพาณิชย์',
   'บางนา, ศรีนครินทร์, เกษตร, รัชโยธิน, จตุจักร, ลาดพร้าว', 'BN,SR,BST,KS', 'published', 3),
  ('chonburi', 'ชลบุรี', 'อีซูซุ สำหรับลูกค้าชลบุรี ซื้อรถและต่ออุปกรณ์กับอีซูซุกรุงเทพเซลส์',
   E'ลูกค้าในชลบุรีขอใบเสนอราคา ปรึกษารถเพื่อการพาณิชย์ และนัดชมรถได้กับอีซูซุกรุงเทพเซลส์ สาขาฝั่งตะวันออกของกรุงเทพฯ คือบางเสาธงและบางนา',
   'ชลบุรี, บางบ่อ, บางนา-ตราด', 'BST,BN', 'published', 4)
on conflict (slug) do nothing;

-- 3) หน้า "ทำไมต้องเรา"
insert into public.pages (slug, name, path, seo_title, seo_description, sort_order)
values ('why', 'ทำไมต้องเรา', '/why', 'ทำไมต้องอีซูซุกรุงเทพเซลส์ · SSI อันดับ 1 กรุงเทพฯ และปริมณฑล',
        'อีซูซุกรุงเทพเซลส์ ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. 2525 · ความพึงพอใจ SSI อันดับ 1 เขตกรุงเทพฯ และปริมณฑล · บริการครบวงจร ดูแลตลอดการใช้งาน · ช่วยเหลือฉุกเฉิน 24 ชั่วโมง', 6)
on conflict (slug) do nothing;

-- 4) ถาม-ตอบตรงคำค้น "บริการดี / ราคาดี / น่าเชื่อถือ"
insert into public.faqs (group_key, question, answer, status, sort_order)
select v.g, v.q, v.a, 'published'::public.content_status, v.n
from (values
  ('why', 'อีซูซุที่ไหนบริการดี ในกรุงเทพฯ และปริมณฑล?',
   E'อีซูซุกรุงเทพเซลส์ได้คะแนนความพึงพอใจลูกค้า (SSI) อันดับ 1 เขตกรุงเทพฯ และปริมณฑล บริการครบวงจรตั้งแต่ขาย ต่ออุปกรณ์ ศูนย์บริการ อะไหล่แท้ ดูแลลูกค้าตลอดการใช้งาน และมีบริการช่วยเหลือฉุกเฉิน 24 ชั่วโมง', 10),
  ('why', 'ซื้อรถอีซูซุที่ไหนราคาดี โปรโมชั่นดี?',
   E'อีซูซุกรุงเทพเซลส์เปิดเผยราคาแนะนำทุกรุ่นย่อยไว้บนเว็บไซต์ และรวมโปรโมชั่นปัจจุบันไว้ที่หน้าโปรโมชั่น ขอใบเสนอราคาออนไลน์ได้ ทีมขายจะคำนวณดาวน์ ค่างวด และสิทธิพิเศษตามรุ่นที่สนใจให้', 11),
  ('why', 'อีซูซุกรุงเทพเซลส์ น่าเชื่อถือไหม?',
   E'อีซูซุกรุงเทพเซลส์เป็นผู้จำหน่ายรถอีซูซุมาตั้งแต่ พ.ศ. 2525 มี 4 สาขาในกรุงเทพฯ และปริมณฑล และได้คะแนนความพึงพอใจลูกค้า (SSI) อันดับ 1 เขตกรุงเทพฯ และปริมณฑล ดูรีวิวจากลูกค้าจริงบน Google Maps ได้ในหน้าข้อมูลแต่ละสาขา', 12),
  ('why', 'มีบริการช่วยเหลือฉุกเฉินไหม?',
   E'มี อีซูซุกรุงเทพเซลส์มีบริการช่วยเหลือฉุกเฉิน 24 ชั่วโมง ดูแลลูกค้าตลอดการใช้งานรถ', 13)
) as v(g, q, a, n)
where not exists (select 1 from public.faqs f where f.group_key = v.g and f.question = v.q);
