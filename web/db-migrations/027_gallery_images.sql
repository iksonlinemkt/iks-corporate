-- แกลเลอรีรูป (เช่น รูป D-MAX / MU-X Bi-Turbo ในหน้า /biturbo) · จัดการได้ที่หลังบ้าน → แกลเลอรีรูป
create table if not exists public.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  group_key   text not null check (group_key ~ '^[a-z0-9-]+$' and char_length(group_key) <= 40),
  image       text not null check (char_length(image) <= 300),
  thumb       text check (char_length(thumb) <= 300),
  alt         text check (char_length(alt) <= 160),
  width       int check (width > 0),
  height      int check (height > 0),
  source      text check (char_length(source) <= 120),
  status      public.content_status not null default 'published',
  is_visible  boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references public.admin_users(id) on delete set null
);
create index if not exists gallery_images_group_idx on public.gallery_images (group_key, sort_order);
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'gallery_images_touch') then
    create trigger gallery_images_touch before update on public.gallery_images for each row execute function public.touch_row();
    create trigger gallery_images_audit after insert or update or delete on public.gallery_images for each row execute function public.write_audit();
  end if;
end $$;
create or replace view public.published_gallery_images as
  select * from public.gallery_images where status = 'published' and is_visible;
grant select on public.published_gallery_images to iks_web_public;
grant select, insert, update, delete on public.gallery_images to iks_web_admin;
