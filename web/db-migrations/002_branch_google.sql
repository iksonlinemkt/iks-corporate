set client_min_messages = warning;
-- 002: สาขาเชื่อม Google Maps (Place ID) + ส่วนรีวิวจาก Google
-- รันซ้ำได้ (idempotent)
alter table public.branches add column if not exists google_place_id text;
alter table public.branches drop constraint if exists branches_google_place_id_check;
alter table public.branches add constraint branches_google_place_id_check
  check (google_place_id ~ '^[A-Za-z0-9_-]+$' and char_length(google_place_id) between 10 and 300);

-- view แบบ select * ต้องสร้างใหม่ให้เห็นคอลัมน์ที่เพิ่ม (สิทธิ์เดิมยังอยู่)
create or replace view public.published_branches as
  select * from public.branches where status = 'published' and is_visible;

insert into public.page_sections (page_slug, section_key, label, title, subtitle, status, sort_order) values
  ('home',    'reviews', 'รีวิวจาก Google', 'ลูกค้าพูดถึงเรา', 'รีวิวจริงจาก Google Maps ของทุกสาขา', 'published', 8),
  ('contact', 'reviews', 'รีวิวจาก Google', 'รีวิวจากลูกค้า',  'รีวิวจริงจาก Google Maps ของทุกสาขา', 'published', 9)
on conflict (page_slug, section_key) do nothing;
