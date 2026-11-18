-- กลุ่มชลบุรีอีซูซุ: ข้อมูลเครือ + ไทม์ไลน์จริง + ตัวเลขหน้าเกี่ยวกับเรา (ใส่เฉพาะครั้งแรก / แทนเฉพาะข้อมูลตัวอย่าง)
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('group_name',            'ชื่อกลุ่มบริษัทในเครือ',            'company', 'กลุ่มชลบุรีอีซูซุ', 'published', 20),
  ('group_name_en',         'ชื่อกลุ่มบริษัท (อังกฤษ)',            'company', 'Cholburi Isuzu Group', 'published', 21),
  ('group_url',             'เว็บไซต์กลุ่มบริษัท',                 'company', 'https://www.isuzusales.net/', 'published', 22),
  ('group_since',           'กลุ่มก่อตั้งปี (พ.ศ.)',               'company', '2509', 'published', 23),
  ('group_chairman',        'ประธานกลุ่ม (ชื่อ)',                  'company', 'คุณอาทร เตพละกุล', 'published', 24),
  ('group_chairman_title',  'ประธานกลุ่ม (ตำแหน่ง)',               'company', 'ประธานกลุ่มชลบุรีอีซูซุ', 'published', 25),
  ('group_chairman_photo',  'รูปประธานกลุ่ม (ไม่บังคับ)',          'company', null, 'published', 26),
  ('group_chairman_message','สาส์นจากประธาน (เว้นว่าง = ไม่แสดง)', 'company', null, 'published', 27)
on conflict (key) do nothing;

-- ไทม์ไลน์: ลบเฉพาะข้อมูลตัวอย่าง แล้วใส่เหตุการณ์จริง
delete from public.timeline_events where status = 'sample';
insert into public.timeline_events (year, title, description, status, sort_order)
select v.y, v.t, v.d, 'published'::public.content_status, v.n
from (values
  (1962, 'ร่วมคณะดูงานโรงงานอีซูซุ ประเทศญี่ปุ่น', 'คุณอาทร เตพละกุล ประธานกลุ่ม ร่วมคณะผู้แทนจำหน่ายอีซูซุไทยชุดแรก 7 ราย ดูงานโรงงานผลิตรถยนต์อีซูซุที่ประเทศญี่ปุ่น', 10),
  (1966, 'ก่อตั้ง ชลบุรีอีซูซุเซลส์', 'โชว์รูม ศูนย์อะไหล่ และศูนย์บริการอีซูซุแห่งแรกในภาคตะวันออก จุดเริ่มต้นของกลุ่มชลบุรีอีซูซุ', 20),
  (1982, 'ก่อตั้ง อีซูซุกรุงเทพเซลส์', 'บริษัทในเครือกลุ่มชลบุรีอีซูซุ หนึ่งในผู้จำหน่ายอีซูซุรายแรก ๆ ในกรุงเทพฯ และปริมณฑล', 30),
  (2003, 'ก่อตั้ง ระยองอีซูซุเซลส์', 'ขยายการดูแลลูกค้าอีซูซุสู่จังหวัดระยอง', 40),
  (2023, 'ความพึงพอใจ SSI อันดับ 1', 'อีซูซุกรุงเทพเซลส์ได้คะแนนความพึงพอใจลูกค้า (SSI) อันดับ 1 เขตกรุงเทพฯ และปริมณฑล', 50),
  (2025, 'SSI อันดับ 1 อีกครั้ง', 'คะแนนความพึงพอใจลูกค้า (SSI) อันดับ 1 เขตกรุงเทพฯ และปริมณฑล ปี 2568', 60)
) as v(y, t, d, n)
where not exists (select 1 from public.timeline_events e where e.year = v.y and e.title = v.t);

-- ตัวเลขหน้าเกี่ยวกับเรา: แทนเฉพาะข้อมูลตัวอย่าง
delete from public.highlights where group_key = 'about_stats' and status = 'sample';
insert into public.highlights (group_key, icon, title, subtitle, status, sort_order)
select 'about_stats', v.i, v.t, v.s, 'published'::public.content_status, v.n
from (values
  ('handshake', '60 ปี', 'กลุ่มชลบุรีอีซูซุ ตั้งแต่ พ.ศ. 2509', 10),
  ('calendar',  'พ.ศ. 2525', 'ก่อตั้งอีซูซุกรุงเทพเซลส์', 20),
  ('map-pin',   '4 สาขา', 'กรุงเทพฯ และปริมณฑล', 30),
  ('trophy',    'SSI อันดับ 1', 'ความพึงพอใจลูกค้า ปี 2566 และ 2568', 40),
  ('sos',       '24 ชม.', 'บริการช่วยเหลือฉุกเฉิน', 50)
) as v(i, t, s, n)
where not exists (select 1 from public.highlights h where h.group_key = 'about_stats' and h.status <> 'sample');

-- ส่วน "ในเครือกลุ่มชลบุรีอีซูซุ" ในหน้าเกี่ยวกับเรา (ต่อจากแถบตัวเลข)
insert into public.page_sections (page_slug, section_key, label, title, subtitle, body, data, status, sort_order)
select 'about', 'group', 'กลุ่มบริษัทในเครือ', 'ในเครือกลุ่มชลบุรีอีซูซุ', 'ประสบการณ์ผู้จำหน่ายอีซูซุกว่า 60 ปี',
  'อีซูซุกรุงเทพเซลส์ ก่อตั้งเมื่อ พ.ศ. 2525 เป็นบริษัทในเครือกลุ่มชลบุรีอีซูซุ ผู้จำหน่ายอีซูซุที่ดำเนินธุรกิจมาตั้งแต่ พ.ศ. 2509 เราดูแลลูกค้าในกรุงเทพฯ และปริมณฑลด้วยมาตรฐานเดียวกันทั้งกลุ่ม ทั้งงานขาย ศูนย์บริการ และอะไหล่แท้',
  '{"companies": [
     {"code": "CIS", "name": "ชลบุรีอีซูซุเซลส์", "en": "Chonburi Isuzu Sales", "area": "ชลบุรี", "since": "2509", "url": "https://www.isuzusales.net/"},
     {"code": "IKS", "name": "อีซูซุกรุงเทพเซลส์", "en": "Isuzu Krungthep Sales", "area": "กรุงเทพฯ และปริมณฑล", "since": "2525", "current": true},
     {"code": "RIS", "name": "ระยองอีซูซุเซลส์", "en": "Rayong Isuzu Sales", "area": "ระยอง", "since": "2546", "url": "https://www.isuzusales.net/"}
   ]}'::jsonb,
  'published', (select coalesce(max(sort_order), 2) from public.page_sections where page_slug = 'about' and section_key = 'stats')
where not exists (select 1 from public.page_sections where page_slug = 'about' and section_key = 'group');

update public.page_sections set subtitle = 'จากปี 2505 ถึงวันนี้ ก้าวสำคัญของกลุ่มชลบุรีอีซูซุและอีซูซุกรุงเทพเซลส์'
 where page_slug = 'about' and section_key = 'timeline' and subtitle is null;

update public.pages set
  seo_title = 'เกี่ยวกับอีซูซุกรุงเทพเซลส์ ในเครือกลุ่มชลบุรีอีซูซุ',
  seo_description = 'อีซูซุกรุงเทพเซลส์ ก่อตั้ง พ.ศ. 2525 ในเครือกลุ่มชลบุรีอีซูซุ ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. 2509 · 4 สาขาในกรุงเทพฯ และปริมณฑล · SSI อันดับ 1 ปี 2566 และ 2568'
 where slug = 'about' and seo_title = 'เกี่ยวกับอีซูซุกรุงเทพเซลส์ ผู้จำหน่ายรถอีซูซุตั้งแต่ พ.ศ. 2525';

-- ถาม-ตอบ: อยู่ในเครือใคร / ชลบุรี ระยอง
insert into public.faqs (group_key, question, answer, status, sort_order)
select v.g, v.q, v.a, 'published'::public.content_status, v.n
from (values
  ('why', 'อีซูซุกรุงเทพเซลส์ อยู่ในเครือบริษัทอะไร?',
   E'อีซูซุกรุงเทพเซลส์ (ก่อตั้ง พ.ศ. 2525) เป็นบริษัทในเครือกลุ่มชลบุรีอีซูซุ ซึ่งเป็นผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. 2509 มีบริษัทในเครือคือ ชลบุรีอีซูซุเซลส์ (ชลบุรี) อีซูซุกรุงเทพเซลส์ (กรุงเทพฯ และปริมณฑล) และระยองอีซูซุเซลส์ (ระยอง) ประธานกลุ่มคือคุณอาทร เตพละกุล', 14),
  ('why', 'อีซูซุกรุงเทพเซลส์ มีสาขาที่ชลบุรีหรือระยองไหม?',
   E'สาขาของอีซูซุกรุงเทพเซลส์อยู่ในกรุงเทพฯ และสมุทรปราการ 4 สาขา (บางนา ศรีนครินทร์ บางเสาธง เกษตร) ลูกค้าชลบุรีเดินทางมาสาขาบางนาหรือบางเสาธงได้สะดวกผ่านถนนบางนา-ตราด หรือติดต่อบริษัทในเครือ ชลบุรีอีซูซุเซลส์ และระยองอีซูซุเซลส์ ได้ที่ www.isuzusales.net', 15)
) as v(g, q, a, n)
where not exists (select 1 from public.faqs f where f.group_key = v.g and f.question = v.q);
