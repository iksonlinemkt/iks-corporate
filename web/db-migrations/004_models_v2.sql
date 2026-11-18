set client_min_messages = warning;
-- 004: จัดรุ่นรถใหม่ (ปิกอัพ / PPV), รุ่นย่อย+ราคา, FAQ, หน้าทดลองขับ — รันซ้ำได้

-- หมวดรถ: เพิ่มกลุ่ม pickup / ppv
alter table public.vehicle_categories drop constraint if exists vehicle_categories_segment_check;
alter table public.vehicle_categories add constraint vehicle_categories_segment_check
  check (segment in ('pickup', 'ppv', 'passenger', 'commercial'));

-- รุ่นย่อย (เกรด) + ราคา
create table if not exists public.vehicle_grades (
  id            uuid primary key default gen_random_uuid(),
  vehicle_id    uuid not null references public.vehicles(id) on delete cascade,
  name          text not null check (char_length(name) <= 80),
  price         numeric(12, 2) check (price is null or price >= 0),
  engine        text check (char_length(engine) <= 80),
  power         text check (char_length(power) <= 40),
  torque        text check (char_length(torque) <= 60),
  transmission  text check (char_length(transmission) <= 40),
  drive         text check (char_length(drive) <= 20),
  wheels        text check (char_length(wheels) <= 60),
  screen        text check (char_length(screen) <= 40),
  features      text check (char_length(features) <= 300),
  status        public.content_status not null default 'published',
  is_visible    boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.admin_users(id) on delete set null
);
create index if not exists vehicle_grades_vehicle_idx on public.vehicle_grades (vehicle_id, sort_order);

-- คำถามที่พบบ่อย
create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  group_key   text not null check (group_key in ('general', 'commercial', 'test_drive', 'service')),
  question    text not null check (char_length(question) <= 200),
  answer      text not null check (char_length(answer) <= 2000),
  status      public.content_status not null default 'draft',
  is_visible  boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.admin_users(id) on delete set null
);

do $$
declare t text;
begin
  foreach t in array array['vehicle_grades', 'faqs'] loop
    if not exists (select 1 from pg_trigger where tgname = t || '_touch') then
      execute format('create trigger %I before update on public.%I for each row execute function public.touch_row()', t || '_touch', t);
      execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.write_audit()', t || '_audit', t);
    end if;
  end loop;
end $$;

create or replace view public.published_vehicle_grades as
  select g.* from public.vehicle_grades g
    join public.vehicles v on v.id = g.vehicle_id
   where g.status = 'published' and g.is_visible and v.status = 'published' and v.is_visible;
create or replace view public.published_faqs as
  select * from public.faqs where status = 'published' and is_visible;
grant select on public.published_vehicle_grades, public.published_faqs to iks_web_public;
grant select, insert, update, delete on public.vehicle_grades, public.faqs to iks_web_admin;

-- กลุ่มรุ่นรถตามที่ใช้ขายจริง
insert into public.vehicle_categories (slug, segment, name, subtitle, icon, status, sort_order) values
  ('commercial-pickup', 'pickup', 'รถเพื่อการพาณิชย์', 'Spark · Cab Chassis · กระบะ 3 บาน — เลือกรุ่น แล้วต่ออุปกรณ์ตามธุรกิจ', 'truck',  'published', 10),
  ('space-cab',         'pickup', 'Space Cab',        'กระบะแคป ห้องโดยสารกว้าง',                                    'pickup', 'published', 20),
  ('cab4',              'pickup', 'Cab4',             'กระบะ 4 ประตู',                                               'pickup', 'published', 30),
  ('v-cross',           'pickup', 'V-Cross',          'ขับเคลื่อน 4 ล้อ ลุยได้ทุกเส้นทาง',                            'pickup', 'published', 40),
  ('x-series',          'pickup', 'X-Series',         'สไตล์สปอร์ต',                                                  'pickup', 'published', 50),
  ('mu-x',              'ppv',    'MU-X',             'รถอเนกประสงค์ PPV 7 ที่นั่ง',                                   'suv',    'published', 60)
on conflict (slug) do update set segment = excluded.segment, name = excluded.name, subtitle = excluded.subtitle,
  icon = excluded.icon, status = 'published', sort_order = excluded.sort_order;

-- ไม่ขายรถบรรทุกบนเว็บ
delete from public.vehicles where slug in ('elf', 'forward', 'giga');
delete from public.vehicle_categories where slug in ('light-truck', 'medium-truck', 'heavy-truck', 'dump-truck', 'tractor-head', 'bus-chassis', 'special');

-- ปีก่อตั้ง (ใช้ในข้อความความน่าเชื่อถือ และข้อมูลสำหรับ Google/AI)
insert into public.site_settings (key, label, group_name, value, status, sort_order)
values ('founded_year', 'ปีที่ก่อตั้ง (พ.ศ.)', 'company', '2525', 'published', 3)
on conflict (key) do nothing;

-- หน้าทดลองขับ
insert into public.pages (slug, name, path, seo_title, seo_description, sort_order)
values ('test-drive', 'จองทดลองขับ', '/test-drive', 'จองทดลองขับรถอีซูซุ | อีซูซุกรุงเทพเซลส์',
        'จองทดลองขับ ISUZU D-MAX, Spark, V-Cross, X-Series และ MU-X ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', 9)
on conflict (slug) do nothing;
update public.pages set seo_description = 'รุ่นรถอีซูซุพร้อมราคาทุกรุ่นย่อย: Spark, Cab Chassis, กระบะ 3 บาน, Space Cab, Cab4, V-Cross, X-Series และ MU-X ที่อีซูซุกรุงเทพเซลส์'
 where slug = 'models' and (seo_description is null or seo_description = 'รวมรถอีซูซุทุกรุ่น D-MAX, MU-X และรถเพื่อการพาณิชย์ พร้อมราคาและโปรโมชั่น');
-- ทำครั้งแรกครั้งเดียว: เปลี่ยนเฉพาะค่าตั้งต้นที่ยังมีคำว่า "รถบรรทุก" (ไม่ทับค่าที่แก้ในหลังบ้านหรือรอบ SEO)
update public.pages set seo_description = 'ผู้จำหน่ายรถยนต์อีซูซุ ตั้งแต่ พ.ศ. 2525 · 4 สาขา บางนา ศรีนครินทร์ บางเสาธง เกษตร · รถกระบะเพื่อการพาณิชย์ ต่อตู้ ต่อหลังคา พร้อมศูนย์บริการ'
 where slug = 'home' and (seo_description is null or seo_description like '%รถบรรทุก%');

-- ส่วนใหม่ในหน้าเว็บ
insert into public.page_sections (page_slug, section_key, label, title, subtitle, status, sort_order) values
  ('commercial', 'commercial_models', 'รุ่นรถสำหรับต่ออุปกรณ์', 'รุ่นรถสำหรับต่ออุปกรณ์', 'Spark · Cab Chassis · กระบะ 3 บาน พร้อมราคาแนะนำ', 'published', 3),
  ('commercial', 'faq',               'คำถามที่พบบ่อย',        'คำถามที่พบบ่อย', null, 'published', 8),
  ('models',     'faq',               'คำถามที่พบบ่อย',        'คำถามที่พบบ่อย', null, 'published', 9),
  ('home',       'trust',             'ความน่าเชื่อถือ',        'อยู่เคียงข้างคนไทยตั้งแต่ พ.ศ. 2525', null, 'published', 2)
on conflict (page_slug, section_key) do nothing;

-- FAQ เริ่มต้น (published = ข้อเท็จจริงทั่วไป / sample = รอทีมเติมรายละเอียดของบริษัท)
insert into public.faqs (group_key, question, answer, status, sort_order)
select group_key, question, answer, status::public.content_status, sort_order from (values
  ('general', 'อีซูซุกรุงเทพเซลส์คือใคร',
   'อีซูซุกรุงเทพเซลส์ (ISUZU KRUNGTHEP SALES) เป็นผู้จำหน่ายรถยนต์อีซูซุ ก่อตั้งเมื่อ พ.ศ. 2525 มีโชว์รูมและศูนย์บริการ 4 สาขา ได้แก่ บางนา ศรีนครินทร์ บางเสาธง และเกษตร จำหน่ายรถกระบะ ISUZU D-MAX รถเพื่อการพาณิชย์ และรถอเนกประสงค์ MU-X', 'published', 10),
  ('general', 'ราคารถบนเว็บไซต์อ้างอิงจากที่ไหน',
   'ราคาที่แสดงเป็นราคาแนะนำจากตรีเพชรอีซูซุเซลส์ อาจเปลี่ยนแปลงได้ตามประกาศของบริษัทผู้ผลิต สำหรับโปรโมชั่น เงินดาวน์ และราคาพิเศษ กรุณาสอบถามที่ปรึกษาการขายของแต่ละสาขา', 'published', 20),
  ('commercial', 'รถกระบะอีซูซุรุ่นไหนเหมาะกับการต่อตู้หรือต่ออุปกรณ์',
   'Spark Cab Chassis (แชสซีเปล่า) เหมาะกับการต่อตู้ทึบ ตู้เย็น หรือตัวถังเฉพาะงาน ส่วน Spark กระบะมาตรฐานและ Spark กระบะ 3 บาน (Flat Deck) เหมาะกับการต่อคอก ต่อหลังคา หรืองานบรรทุกทั่วไป ที่ปรึกษาการขายช่วยแนะนำรุ่นและอุปกรณ์ให้เหมาะกับธุรกิจได้', 'published', 10),
  ('commercial', 'ต่ออุปกรณ์อะไรได้บ้าง',
   'ตัวอย่างที่นิยม ได้แก่ ตู้ทึบสำหรับขนส่งสินค้า ตู้เย็นสำหรับสินค้าควบคุมอุณหภูมิ ฟู้ดทรัคสำหรับธุรกิจอาหาร คอกเหล็กหรือคอกสูง หลังคาอลูมิเนียม และหลังคาไฟเบอร์', 'published', 20),
  ('commercial', 'ต่ออุปกรณ์ใช้เวลากี่วัน', 'กรุณาใส่ระยะเวลาโดยประมาณของการต่ออุปกรณ์แต่ละแบบ', 'sample', 30),
  ('commercial', 'ค่าต่ออุปกรณ์รวมในไฟแนนซ์ได้ไหม', 'กรุณาใส่เงื่อนไขไฟแนนซ์สำหรับรถที่ต่ออุปกรณ์', 'sample', 40),
  ('test_drive', 'ทดลองขับได้ที่สาขาไหน',
   'จองทดลองขับได้ที่สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร เลือกสาขาและวันเวลาที่สะดวกในแบบฟอร์ม ทีมงานจะโทรยืนยันรุ่นรถที่พร้อมให้ทดลองขับ', 'published', 10),
  ('test_drive', 'ต้องเตรียมอะไรมาทดลองขับ', 'กรุณานำใบอนุญาตขับขี่ที่ยังไม่หมดอายุมาในวันทดลองขับ', 'published', 20),
  ('test_drive', 'ทดลองขับมีค่าใช้จ่ายไหม', 'กรุณาใส่เงื่อนไขการทดลองขับของบริษัท', 'sample', 30)
) as v(group_key, question, answer, status, sort_order)
where not exists (select 1 from public.faqs f where f.question = v.question);

-- หน้ารุ่นรถ: ส่วน "เลือกหมวด" กลายเป็นตัวเลือกรุ่นแบบแท็บ · ส่วนเดิมที่ซ้ำกันซ่อนไว้
update public.page_sections set label = 'รุ่นรถทั้งหมด (แท็บปิกอัพ / PPV)' where page_slug = 'models' and section_key = 'categories';
update public.page_sections set is_visible = false where page_slug = 'models' and section_key in ('featured', 'finder', 'all_models');
