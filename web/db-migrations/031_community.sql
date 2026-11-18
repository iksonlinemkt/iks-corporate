-- เมนู Community: คลับที่รวมคนที่มีความชอบคล้ายกัน (เริ่มที่ "คลับส่งสุข") + โพสต์ของแต่ละคลับ (รูป + ข้อความ)
create table if not exists public.communities (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name         text not null check (char_length(name) <= 60),
  tagline      text check (char_length(tagline) <= 160),
  description  text check (char_length(description) <= 5000),
  cover_image  text check (char_length(cover_image) <= 300),
  logo         text check (char_length(logo) <= 300),
  gallery      jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array'),
  join_label   text check (char_length(join_label) <= 40),
  join_url     text check (char_length(join_url) <= 500),
  status       public.content_status not null default 'draft',
  is_visible   boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid references public.admin_users(id) on delete set null
);
create table if not exists public.community_posts (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  title         text not null check (char_length(title) <= 120),
  body          text check (char_length(body) <= 5000),
  images        jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  video_url     text check (video_url is null or char_length(video_url) <= 500),
  post_date     date,
  status        public.content_status not null default 'published',
  is_visible    boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.admin_users(id) on delete set null
);
create index if not exists community_posts_club_idx on public.community_posts (community_id, post_date desc);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'communities_touch') then
    create trigger communities_touch before update on public.communities for each row execute function public.touch_row();
    create trigger communities_audit after insert or update or delete on public.communities for each row execute function public.write_audit();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'community_posts_touch') then
    create trigger community_posts_touch before update on public.community_posts for each row execute function public.touch_row();
    create trigger community_posts_audit after insert or update or delete on public.community_posts for each row execute function public.write_audit();
  end if;
end $$;
create or replace view public.published_communities as
  select * from public.communities where status = 'published' and is_visible;
create or replace view public.published_community_posts as
  select p.* from public.community_posts p
  join public.communities c on c.id = p.community_id and c.status = 'published' and c.is_visible
  where p.status = 'published' and p.is_visible;
grant select on public.published_communities, public.published_community_posts to iks_web_public;
grant select, insert, update, delete on public.communities, public.community_posts to iks_web_admin;

-- คลับแรก: คลับส่งสุข
insert into public.communities (slug, name, tagline, description, join_label, status, sort_order)
values ('songsuk-club', 'คลับส่งสุข',
  'คลับฟุตบอลและกิจกรรมสร้างความสัมพันธ์ ของคนที่ชอบสิ่งเดียวกัน',
  E'คลับส่งสุข คือคลับของคนที่รักฟุตบอลและชอบทำกิจกรรมร่วมกัน\nเรารวมเพื่อน ๆ ลูกค้า และครอบครัวอีซูซุกรุงเทพเซลส์ มาเตะบอล เชียร์บอล และสร้างความสัมพันธ์ในรูปแบบต่าง ๆ\n- ฟุตบอลกระชับมิตรและการแข่งขัน\n- กิจกรรมสังสรรค์และสร้างความสัมพันธ์\n- ข่าวสารและภาพบรรยากาศจากทุกกิจกรรมของคลับ',
  'สนใจร่วมคลับ', 'published', 10)
on conflict (slug) do nothing;

insert into public.pages (slug, name, path, seo_title, seo_description, sort_order)
values ('community', 'Community', '/community', 'Community คลับของคนชอบเหมือนกัน | อีซูซุกรุงเทพเซลส์',
        'Community ของอีซูซุกรุงเทพเซลส์ คลับที่รวมคนที่มีความชอบคล้ายกัน เช่น คลับส่งสุข คลับฟุตบอลและกิจกรรมสร้างความสัมพันธ์ ติดตามภาพและข่าวกิจกรรมได้ที่นี่', 8)
on conflict (slug) do nothing;
