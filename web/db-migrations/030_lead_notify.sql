-- แจ้งเตือนลูกค้าใหม่เข้ากลุ่ม LINE (รหัสกลุ่มไม่ใช่ความลับ · token เก็บนอกฐานข้อมูลที่ /root/iks-web/line_channel_token)
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('line_group_default', 'กลุ่ม LINE รวม (รหัสกลุ่มขึ้นต้นด้วย C)', 'leadnotify', null, 'published', 1),
  ('line_group_bn',      'กลุ่ม LINE สาขาบางนา (ไม่ใส่ = ใช้กลุ่มรวม)', 'leadnotify', null, 'published', 2),
  ('line_group_sr',      'กลุ่ม LINE สาขาศรีนครินทร์', 'leadnotify', null, 'published', 3),
  ('line_group_bst',     'กลุ่ม LINE สาขาบางเสาธง', 'leadnotify', null, 'published', 4),
  ('line_group_ks',      'กลุ่ม LINE สาขาเกษตร', 'leadnotify', null, 'published', 5),
  ('lead_notify_types',  'ประเภทที่แจ้งเตือน', 'leadnotify', 'test_drive,quote,commercial,launch,contact', 'published', 6)
on conflict (key) do nothing;
