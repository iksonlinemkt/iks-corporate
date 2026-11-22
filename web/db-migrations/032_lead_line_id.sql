-- ฟอร์มลูกค้า: เพิ่มช่อง LINE ID (ไม่บังคับ) สำหรับติดต่อกลับเมื่อโทรไม่สะดวก
set client_min_messages = warning;
alter table public.leads add column if not exists line_id text check (line_id is null or char_length(line_id) <= 60);
-- สิทธิ์: เว็บ (public) บันทึกได้ · หลังบ้านอ่าน/แก้ได้ (ให้ซ้ำได้ ไม่มีผลเสีย)
grant insert (line_id) on public.leads to iks_web_public;
grant select (line_id), update (line_id) on public.leads to iks_web_admin;
