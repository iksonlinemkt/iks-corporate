set client_min_messages = warning;
-- 008: ภาพหน้าปกวิดีโอ (poster) ของแคมเปญ — รันซ้ำได้
alter table public.campaigns add column if not exists video_poster text;
create or replace view public.published_campaigns as
  select * from public.campaigns where status = 'published' and is_visible;
