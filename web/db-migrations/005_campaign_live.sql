set client_min_messages = warning;
-- 005: หน้าแคมเปญเปิดตัวรุ่นใหม่ + ไลฟ์ (Facebook / YouTube) + lead ประเภท launch — รันซ้ำได้

alter table public.leads drop constraint if exists leads_lead_type_check;
alter table public.leads add constraint leads_lead_type_check
  check (lead_type in ('quote', 'test_drive', 'service_booking', 'contact', 'commercial', 'launch'));

create table if not exists public.campaigns (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9-]+$'),
  nav_label      text not null default 'รุ่นใหม่' check (char_length(nav_label) <= 20),
  show_in_nav    boolean not null default true,
  eyebrow        text check (char_length(eyebrow) <= 60),
  title          text not null check (char_length(title) <= 80),
  highlight      text check (char_length(highlight) <= 80),
  body           text check (char_length(body) <= 500),
  date_text      text check (char_length(date_text) <= 60),
  launch_at      timestamptz,
  live_hours     int not null default 3 check (live_hours between 1 and 48),
  mode           text not null default 'auto' check (mode in ('auto', 'upcoming', 'live', 'ended')),
  teaser_url     text,
  live_url       text,
  replay_url     text,
  image_desktop  text,
  image_mobile   text,
  points         jsonb not null default '[]'::jsonb check (jsonb_typeof(points) = 'array'),
  offer_title    text check (char_length(offer_title) <= 80),
  offer_body     text check (char_length(offer_body) <= 500),
  form_title     text check (char_length(form_title) <= 80),
  status         public.content_status not null default 'draft',
  is_visible     boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     uuid references public.admin_users(id) on delete set null
);

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'campaigns_touch') then
    create trigger campaigns_touch before update on public.campaigns for each row execute function public.touch_row();
    create trigger campaigns_audit after insert or update or delete on public.campaigns for each row execute function public.write_audit();
  end if;
end $$;

create or replace view public.published_campaigns as
  select * from public.campaigns where status = 'published' and is_visible;
grant select on public.published_campaigns to iks_web_public;
grant select, insert, update, delete on public.campaigns to iks_web_admin;

insert into public.pages (slug, name, path, seo_title, seo_description, sort_order)
values ('live', 'เปิดตัวรุ่นใหม่ (ไลฟ์)', '/live', 'ISUZU เปิดตัวพลังใหม่ ไบเทอร์โบ 22 ต.ค. 2569 | อีซูซุกรุงเทพเซลส์',
        'ชมไลฟ์เปิดตัวอีซูซุพลังใหม่ ไบเทอร์โบ 22 ตุลาคม 2569 ลงทะเบียนรับราคาและสิทธิพิเศษก่อนใคร กับอีซูซุกรุงเทพเซลส์ 4 สาขา', 10)
on conflict (slug) do nothing;

insert into public.campaigns (slug, nav_label, eyebrow, title, highlight, body, date_text, points, form_title, status, sort_order)
values ('bi-turbo-2026', 'รุ่นใหม่', 'ISUZU เปิดตัวพลังใหม่', 'THE ABSOLUTE POWER', 'พลังใหม่! ไบเทอร์โบ แรง…หยุดโลก',
        'ชมไลฟ์เปิดตัวพร้อมกัน แล้วลงทะเบียนกับอีซูซุกรุงเทพเซลส์ รับข้อมูล ราคา และสิทธิพิเศษก่อนใคร',
        '22 ตุลาคม 2569', '["แรงกว่า", "เร็วกว่า", "ประหยัดกว่า"]', 'ลงทะเบียนรับข้อมูลก่อนใคร', 'published', 10)
on conflict (slug) do nothing;
