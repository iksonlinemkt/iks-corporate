-- หน้า Happy Whale: ส่วนคลิปแนะนำตัว (วิดีโอ + ข้อความสรุปด้านข้าง)
alter table public.page_sections add column if not exists video_url text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'page_sections_video_url_check') then
    alter table public.page_sections add constraint page_sections_video_url_check check (video_url is null or char_length(video_url) <= 500);
  end if;
end $$;

create or replace view public.published_page_sections as
  select id, page_slug, section_key, label, title, subtitle, body, cta_label, cta_url, image, data, status, is_visible,
         sort_order, created_at, updated_at, updated_by, video_url
  from public.page_sections where status = 'published' and is_visible;
grant select on public.published_page_sections to iks_web_public;

do $$
declare h int;
begin
  if not exists (select 1 from public.page_sections where page_slug = 'happy-whale' and section_key = 'video') then
    select coalesce(min(sort_order), 0) into h from public.page_sections where page_slug = 'happy-whale' and section_key = 'hero';
    update public.page_sections set sort_order = sort_order + 1 where page_slug = 'happy-whale' and sort_order > h;
    insert into public.page_sections (page_slug, section_key, label, title, subtitle, body, cta_label, cta_url, status, sort_order)
    values ('happy-whale', 'video', 'คลิปแนะนำ Happy Whale',
      'สวัสดีครับ ผม Happy Whale', 'มาสคอตของอีซูซุกรุงเทพเซลส์',
      E'Happy Whale คือตัวแทนความห่วงใยของอีซูซุกรุงเทพเซลส์ ที่อยากดูแลลูกค้าทุกคนเหมือนเพื่อนร่วมทาง\n- วาฬ: ตัวใหญ่ใจดี แข็งแรง เดินทางไกลได้อย่างมั่นคง\n- หัวใจ: ใส่ใจลูกค้าในทุกช่วงของการใช้รถ ตั้งแต่วันออกรถจนถึงการดูแลหลังการขาย\n- อยู่เคียงข้างลูกค้าทั้ง 4 สาขา บางนา · ศรีนครินทร์ · บางเสาธง · เกษตร',
      'รู้จัก Happy Whale มากขึ้น', '#intro', 'published', h + 1);
  end if;
end $$;
