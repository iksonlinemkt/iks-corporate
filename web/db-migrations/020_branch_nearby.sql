-- พื้นที่ใกล้เคียงของแต่ละสาขา (ใช้กับ SEO/AI เช่น "อีซูซุ รัชโยธิน" → สาขาเกษตร)
alter table public.branches add column if not exists nearby text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'branches_nearby_check') then
    alter table public.branches add constraint branches_nearby_check check (nearby is null or char_length(nearby) <= 300);
  end if;
end $$;

create or replace view public.published_branches as
  select id, code, name, address, district, province, postcode, phone, line_id, line_url, email, map_url, latitude, longitude,
         image, has_showroom, has_service, has_parts, hours_showroom, hours_service, hours_parts, is_headquarters, status,
         is_visible, sort_order, created_at, updated_at, updated_by, google_place_id, nearby
  from public.branches where status = 'published' and is_visible;
grant select on public.published_branches to iks_web_public;

-- สาขาเกษตร: ตั้งค่าเริ่มต้น (แก้ได้ที่ หลังบ้าน → สาขา)
update public.branches set nearby = 'รัชโยธิน, ม.เกษตรศาสตร์, เสนานิคม, ลาดยาว, จตุจักร, พหลโยธิน'
where code = 'KS' and nearby is null;
