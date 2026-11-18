set client_min_messages = warning;
-- 007: แคมเปญเปิดตัวขึ้นบนสุดของหน้าแรก + เมนูลัดหน้าแรก — รันซ้ำได้
alter table public.campaigns add column if not exists show_on_home boolean not null default true;
create or replace view public.published_campaigns as
  select * from public.campaigns where status = 'published' and is_visible;

-- เมนูลัดหน้าแรก: ถ้ายังเป็นข้อมูลตัวอย่างทั้งหมด → แทนด้วยชุดใหม่และเผยแพร่
do $$
begin
  if not exists (select 1 from public.highlights where group_key = 'home_quick' and status <> 'sample') then
    delete from public.highlights where group_key = 'home_quick';
    insert into public.highlights (group_key, icon, title, subtitle, url, status, sort_order) values
      ('home_quick', 'pickup',   'รุ่นรถ',             'ราคาทุกรุ่นย่อย',          '/models',            'published', 10),
      ('home_quick', 'truck',    'รถเพื่อการพาณิชย์',   'ต่อตู้ ต่อหลังคา ต่อคอก',   '/commercial',        'published', 20),
      ('home_quick', 'calendar', 'จองทดลองขับ',        'เลือกวันและสาขาได้เอง',    '/test-drive',        'published', 30),
      ('home_quick', 'tag',      'โปรโมชั่น',          'ข้อเสนอเดือนนี้',           '/promotions',        'published', 40),
      ('home_quick', 'wrench',   'ศูนย์บริการ',        'นัดเข้าเช็กระยะ',           '/service',           'published', 50),
      ('home_quick', 'map-pin',  'สาขาใกล้คุณ',        'แผนที่และนำทาง',           '/contact#branches',  'published', 60);
  end if;
end $$;
update public.page_sections set status = 'published', is_visible = true
 where page_slug = 'home' and section_key = 'quick_links' and status = 'sample';
