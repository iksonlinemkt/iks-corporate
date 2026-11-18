-- แถบบนสุดของเว็บ: เบอร์ฝ่ายขาย / ศูนย์บริการ (แก้ได้ที่ ตั้งค่าเว็บ → ช่องทางติดต่อ)
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('phone_sales',   'เบอร์ฝ่ายขาย (แถบบนสุด)',     'contact', null, 'published', 14),
  ('phone_service', 'เบอร์ศูนย์บริการ (แถบบนสุด)', 'contact', null, 'published', 15)
on conflict (key) do nothing;
