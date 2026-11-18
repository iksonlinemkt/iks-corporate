-- เมนู "บริการ" → "กิจกรรม" · ย้ายเนื้อหางานบริการไปหน้า "ติดต่อเรา"

-- 1) กิจกรรม: ใส่คลิปได้
alter table public.activities add column if not exists video_url text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'activities_video_url_check') then
    alter table public.activities add constraint activities_video_url_check check (video_url is null or char_length(video_url) <= 500);
  end if;
end $$;
create or replace view public.published_activities as
  select id, slug, title, summary, body, cover_image, gallery, event_date, status, is_visible, sort_order,
         created_at, updated_at, updated_by, video_url
  from public.activities where status = 'published' and is_visible;
grant select on public.published_activities to iks_web_public;

-- 2) หน้า "กิจกรรม"
insert into public.pages (slug, name, path, seo_title, seo_description, sort_order)
values ('activities', 'กิจกรรม', '/activities', 'กิจกรรม | อีซูซุกรุงเทพเซลส์',
        'ภาพและคลิปกิจกรรมของอีซูซุกรุงเทพเซลส์ งานเปิดตัวรถ กิจกรรมเพื่อลูกค้า และ Happy Whale ทั้ง 4 สาขา บางนา ศรีนครินทร์ บางเสาธง เกษตร', 5)
on conflict (slug) do nothing;
insert into public.page_sections (page_slug, section_key, label, title, subtitle, status, sort_order) values
  ('activities', 'hero', 'แบนเนอร์', null, null, 'published', 1),
  ('activities', 'list', 'รายการกิจกรรม', 'กิจกรรมของเรา', 'ภาพบรรยากาศและคลิปกิจกรรมของอีซูซุกรุงเทพเซลส์', 'published', 2)
on conflict (page_slug, section_key) do nothing;

-- 3) ย้ายส่วนงานบริการไปหน้า "ติดต่อเรา" (ต่อจากฟอร์มติดต่อ)
do $$
declare f int;
begin
  if not exists (select 1 from public.page_sections where page_slug = 'contact' and section_key = 'booking') then
    select coalesce((select sort_order from public.page_sections where page_slug = 'contact' and section_key = 'form'), 0) into f;
    update public.page_sections set sort_order = sort_order + 3 where page_slug = 'contact' and sort_order > f;
    insert into public.page_sections (page_slug, section_key, label, title, subtitle, body, cta_label, cta_url, image, data, status, is_visible, sort_order)
    select 'contact', k.key, k.label,
           coalesce(s.title, k.title), s.subtitle, s.body, s.cta_label, s.cta_url, s.image, coalesce(s.data, '{}'::jsonb),
           coalesce(s.status, 'published'), coalesce(s.is_visible, true), f + k.n
    from (values ('booking', 'จองนัดหมายบริการ', 'จองนัดหมายบริการออนไลน์', 1),
                 ('services', 'บริการหลังการขาย', 'บริการหลังการขาย', 2),
                 ('service_package', 'แพ็กเกจบริการ', 'แพ็กเกจบริการสุดคุ้ม', 3)) as k(key, label, title, n)
    left join public.page_sections s on s.page_slug = 'service' and s.section_key = k.key;
  end if;
end $$;

-- 4) ลิงก์เดิมที่ชี้ไปหน้า "บริการ" → หน้า "ติดต่อเรา"
update public.highlights    set url = '/contact#booking' where url in ('/service', '/service#booking');
update public.highlights    set url = replace(url, '/service#', '/contact#') where url like '/service#%';
update public.services      set cta_url = replace(replace(cta_url, '/service#', '/contact#'), '/service', '/contact#booking') where cta_url like '/service%';
update public.page_sections set cta_url = replace(replace(cta_url, '/service#', '/contact#'), '/service', '/contact#booking') where cta_url like '/service%';
update public.hero_slides   set cta1_url = replace(replace(cta1_url, '/service#', '/contact#'), '/service', '/contact#booking') where cta1_url like '/service%';
update public.hero_slides   set cta2_url = replace(replace(cta2_url, '/service#', '/contact#'), '/service', '/contact#booking') where cta2_url like '/service%';
update public.industries    set url = replace(replace(url, '/service#', '/contact#'), '/service', '/contact#booking') where url like '/service%';
