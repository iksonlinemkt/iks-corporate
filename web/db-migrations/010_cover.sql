-- ภาพปกหน้าแรก: ตั้งค่าข้อความ/รูปโชว์รูม/รุ่นรถ จากหน้า "ตั้งค่าเว็บ"
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('cover_title', 'หัวข้อใหญ่ (ตัวโครเมียม)', 'cover', 'ISUZU IKS', 'published', 200),
  ('cover_line1', 'บรรทัดที่ 1 (ตัวใหญ่สีขาว)', 'cover', 'อีซูซุกรุงเทพเซลส์', 'published', 201),
  ('cover_line2', 'บรรทัดที่ 2', 'cover', 'ผู้จำหน่ายอีซูซุอย่างเป็นทางการ ตั้งแต่ พ.ศ. 2525', 'published', 202),
  ('cover_car', 'รุ่นรถบนภาพปก (slug)', 'cover', 'none', 'published', 203),
  ('cover_image', 'รูปโชว์รูม (ไฟล์ใน /media)', 'cover', null, 'published', 204)
on conflict (key) do nothing;
