-- จองนัดเข้าศูนย์: ใช้ระบบนัดหมายเดียวกับ LINE (Google Apps Script) — แก้ลิงก์ได้ที่ ตั้งค่าเว็บ → ช่องทางติดต่อ
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('booking_url', 'ลิงก์ระบบจองนัดเข้าศูนย์บริการ', 'contact',
   'https://script.google.com/macros/s/AKfycbzorXoBo23WhMOP0PPynDP82rYE_uetPjHpgigWKXaodcGwTRLpgpjvr6VgXexCq1QjeQ/exec', 'published', 16),
  ('booking_embed', 'ฝังฟอร์มจองในหน้าเว็บ (on/off)', 'contact', 'off', 'published', 17)
on conflict (key) do nothing;
