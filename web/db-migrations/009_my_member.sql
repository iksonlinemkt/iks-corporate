set client_min_messages = warning;
-- 009: หน้า my-MEMBER (โปรแกรมสมาชิกอีซูซุ) — รันซ้ำได้
alter table public.faqs drop constraint if exists faqs_group_key_check;
alter table public.faqs add constraint faqs_group_key_check
  check (group_key in ('general', 'commercial', 'test_drive', 'service', 'member', 'why'));

insert into public.pages (slug, name, path, seo_title, seo_description, sort_order)
values ('my-member', 'my-MEMBER สมาชิกอีซูซุ', '/my-member', 'my-MEMBER สมาชิกอีซูซุ สะสมคะแนน รับส่วนลด | อีซูซุกรุงเทพเซลส์',
        'สมัคร my-MEMBER ฟรีผ่านแอป my-ISUZU สะสมคะแนนทุกการเข้าศูนย์ ส่วนลดอะไหล่สูงสุด 15% ส่วนลดซื้อรถใหม่สูงสุด 50,000 บาท ที่อีซูซุกรุงเทพเซลส์ 4 สาขา', 11)
on conflict (slug) do nothing;

insert into public.faqs (group_key, question, answer, status, sort_order)
select group_key, question, answer, status::public.content_status, sort_order from (values
  ('member', 'my-MEMBER คืออะไร',
   'my-MEMBER คือโปรแกรมสมาชิกของอีซูซุผ่านแอป my-ISUZU สะสมคะแนนจากการเข้าศูนย์บริการ การใช้แอป และการแนะนำเพื่อน เพื่อรับส่วนลดและสิทธิพิเศษตามระดับสมาชิก Silver, Gold, Platinum และ Diamond เริ่มอย่างเป็นทางการ 1 ธันวาคม 2568', 'published', 10),
  ('member', 'ใครสมัคร my-MEMBER ได้บ้าง ต้องเสียเงินไหม',
   'ลูกค้าบุคคลทั่วไปที่เป็นเจ้าของรถกระบะหรือรถอเนกประสงค์ (PPV) อีซูซุ สมัครได้ฟรี ไม่มีค่าใช้จ่าย ดาวน์โหลดแอป my-ISUZU แล้วลงทะเบียน ได้รับ 4,000 คะแนนทันที ลูกค้านิติบุคคลและรถบรรทุกยังอยู่ในโปรแกรม "อีซูซุ ยิ่งเข้า ยิ่งคุ้ม"', 'published', 20),
  ('member', 'เข้าศูนย์บริการได้คะแนนเท่าไหร่',
   'ทุกการใช้จ่ายค่าบริการและอะไหล่ 100 บาท ได้ 25 คะแนน เพิ่มเติม เช่น เปลี่ยนน้ำมันเครื่องตรงตามระยะ 300 คะแนน นัดหมายล่วงหน้า 50 คะแนน ใช้สิทธิ์ได้ที่ศูนย์บริการอีซูซุกรุงเทพเซลส์ทุกสาขา ส่วนลดที่ศูนย์บริการหักให้อัตโนมัติ', 'published', 30),
  ('member', 'เลื่อนระดับสมาชิกได้อย่างไร',
   'Silver ได้ทันทีเมื่อเป็นเจ้าของรถอีซูซุ สะสมครบ 15,000 คะแนนเป็น Gold, 20,000 คะแนนเป็น Platinum และ 30,000 คะแนนเป็น Diamond ระดับ Gold ขึ้นไปมีอายุ 1 ปี ต้องสะสมคะแนนในปีปัจจุบันเพื่อคงระดับ', 'published', 40),
  ('member', 'แนะนำเพื่อนซื้อรถได้อะไร',
   'แนะนำเพื่อนมาทดลองขับได้ 500 คะแนน และเมื่อเพื่อนซื้อรถสำเร็จได้ 5,000 คะแนน พร้อมรับมงกุฎ SUPER FAN (มงกุฎเงินเมื่อแนะนำสำเร็จ 1–2 คัน มงกุฎทองตั้งแต่ 3 คันขึ้นไป)', 'published', 50)
) as v(group_key, question, answer, status, sort_order)
where not exists (select 1 from public.faqs f where f.question = v.question);
