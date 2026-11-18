-- SEO ชื่อแบรนด์: "อีซูซุกรุงเทพ" / Isuzu Krungthep / IKS
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('brand_aliases', 'ชื่ออื่นที่ลูกค้าใช้ค้น (คั่นด้วย ,)', 'seo', 'อีซูซุกรุงเทพ, อีซูซุ กรุงเทพ, Isuzu Krungthep, IKS', 'published', 290)
on conflict (key) do nothing;

update public.pages set
  seo_title = 'อีซูซุกรุงเทพ · อีซูซุกรุงเทพเซลส์ ตัวแทนจำหน่ายอีซูซุ กรุงเทพฯ',
  seo_description = 'อีซูซุกรุงเทพ (อีซูซุกรุงเทพเซลส์) ตัวแทนจำหน่ายอีซูซุตั้งแต่ปี 2525 ในเครือกลุ่มชลบุรีอีซูซุ · 4 สาขา บางนา ศรีนครินทร์ บางเสาธง เกษตร · D-MAX MU-X 2.2 Bi-Turbo'
 where slug = 'home' and seo_title = 'อีซูซุกรุงเทพเซลส์ ตัวแทนจำหน่ายรถอีซูซุ กรุงเทพฯ | D-MAX MU-X ต่อตู้';

insert into public.faqs (group_key, question, answer, status, sort_order)
select 'why', 'อีซูซุกรุงเทพ คือที่ไหน เว็บไซต์อะไร?',
  E'อีซูซุกรุงเทพ คือ บริษัท อีซูซุกรุงเทพเซลส์ จำกัด (Isuzu Krungthep Sales · IKS) ตัวแทนจำหน่ายรถอีซูซุตั้งแต่ พ.ศ. 2525 ในเครือกลุ่มชลบุรีอีซูซุ มี 4 สาขา: บางนา ศรีนครินทร์ บางเสาธง และเกษตร เว็บไซต์ทางการคือ isuzukrungthep.com (พิมพ์ อีซูซุกรุงเทพ.com ก็เข้าได้)',
  'published'::public.content_status, 1
where not exists (select 1 from public.faqs where group_key = 'why' and question = 'อีซูซุกรุงเทพ คือที่ไหน เว็บไซต์อะไร?');
