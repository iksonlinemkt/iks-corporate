-- รหัสยืนยัน Google Search Console / Bing Webmaster และ Google Analytics 4 (ตั้งค่าเว็บ → Google / Bing / Analytics)
insert into public.site_settings (key, label, group_name, value, status, sort_order) values
  ('google_site_verification', 'รหัสยืนยัน Google Search Console', 'seo', null, 'published', 300),
  ('bing_site_verification',   'รหัสยืนยัน Bing Webmaster',        'seo', null, 'published', 301),
  ('ga4_id',                   'Google Analytics 4 (รหัสการวัด G-…)', 'seo', null, 'published', 302)
on conflict (key) do nothing;
