-- หน้า 2.2 Bi-Turbo + เมนู "รุ่นใหม่ NEW" ชี้ไปหน้า Bi-Turbo (แก้ได้ที่ ตั้งค่าเว็บ → เมนูรุ่นใหม่ / Bi-Turbo)
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('nav_new_label', 'ชื่อเมนู "NEW" (ข้างหน้าหลัก)', 'newmodel', '2.2 Bi-Turbo', 'published', 1),
  ('nav_new_url',   'ลิงก์เมนู "NEW" (เว้นว่าง = ใช้เมนูแคมเปญ/ไลฟ์)', 'newmodel', '/biturbo', 'published', 2),
  ('nav_new_bar',   'ข้อความแถบประกาศด้านบน', 'newmodel', 'ใหม่! เครื่องยนต์ 2.2 Ddi MAXFORCE Bi-Turbo 204 แรงม้า · นัดทดลองขับล่วงหน้า', 'published', 3),
  ('biturbo_testdrive_note', 'หมายเหตุรถทดลองขับ Bi-Turbo', 'newmodel', 'รถทดลองขับ Bi-Turbo มีจำนวนจำกัด กรุณานัดหมายล่วงหน้า ทีมขายจะติดต่อกลับเพื่อยืนยันวันและสาขา', 'published', 4),
  ('biturbo_image', 'รูปเครื่องยนต์/รถ Bi-Turbo (ไม่บังคับ)', 'newmodel', null, 'published', 5)
on conflict (key) do nothing;

insert into public.pages (slug, name, path, seo_title, seo_description, sort_order)
values ('biturbo', '2.2 Bi-Turbo', '/biturbo', 'อีซูซุ 2.2 Bi-Turbo ใหม่ 204 แรงม้า ราคา V-Cross Hi-Lander MU-X',
        'อีซูซุ 2.2 Ddi MAXFORCE Bi-Turbo ใหม่ 204 แรงม้า 500 นิวตันเมตร ราคา V-Cross, Hi-Lander, MU-X · นัดทดลองขับที่อีซูซุกรุงเทพเซลส์ บางนา ศรีนครินทร์ บางเสาธง เกษตร', 7)
on conflict (slug) do nothing;
