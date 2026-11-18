set client_min_messages = warning;
-- 006: ส่วนที่เพิ่มใหม่ (trust / reviews / faq / commercial_models) ไม่ควรขึ้นเหนือแบนเนอร์หลัก
-- กรณีหลังบ้านเคยจัดลำดับใหม่ (เลขลำดับกลายเป็น 10, 20, 30 …) — แก้เฉพาะรายการที่อยู่เหนือ hero เท่านั้น
with hero as (
  select page_slug, sort_order as h from public.page_sections where section_key = 'hero'
), mx as (
  select page_slug, max(sort_order) as m from public.page_sections group by page_slug
)
update public.page_sections s
   set sort_order = case
         when s.section_key = 'trust' then hero.h + 1
         when s.section_key = 'commercial_models' then hero.h + 15
         else mx.m + 10 end
  from hero, mx
 where hero.page_slug = s.page_slug and mx.page_slug = s.page_slug
   and s.section_key <> 'hero' and s.sort_order < hero.h;
