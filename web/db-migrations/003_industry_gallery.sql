set client_min_messages = warning;
-- 003: ประเภทธุรกิจมีหลายรูป (สไลด์) — รันซ้ำได้
alter table public.industries add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table public.industries drop constraint if exists industries_gallery_is_array;
alter table public.industries add constraint industries_gallery_is_array check (jsonb_typeof(gallery) = 'array');
create or replace view public.published_industries as
  select * from public.industries where status = 'published' and is_visible;
