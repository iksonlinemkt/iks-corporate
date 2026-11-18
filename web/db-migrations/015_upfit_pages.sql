-- หน้ารถต่ออุปกรณ์แยกตามธุรกิจ /commercial/<slug> (สำหรับคำค้น เช่น "D-MAX ต่อตู้ห้องเย็น", "กระบะคอก อีซูซุ")
alter table public.industries add column if not exists slug text;
alter table public.industries add column if not exists headline text;
alter table public.industries add column if not exists description text;
alter table public.industries add column if not exists models_text text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'industries_slug_key') then
    alter table public.industries add constraint industries_slug_key unique (slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'industries_slug_check') then
    alter table public.industries add constraint industries_slug_check check (slug is null or slug ~ '^[a-z0-9-]+$');
    alter table public.industries add constraint industries_headline_check check (headline is null or char_length(headline) <= 80);
    alter table public.industries add constraint industries_description_check check (description is null or char_length(description) <= 3000);
    alter table public.industries add constraint industries_models_text_check check (models_text is null or char_length(models_text) <= 200);
  end if;
end $$;

create or replace view public.published_industries as
  select id, name, subtitle, image, url, status, is_visible, sort_order, created_at, updated_at, updated_by, gallery,
         slug, headline, description, models_text
  from public.industries where status = 'published' and is_visible;
grant select on public.published_industries to iks_web_public;

-- เนื้อหาเริ่มต้น (แก้ได้ในหลังบ้าน → ประเภทธุรกิจ) ใส่เฉพาะแถวที่ยังไม่มี slug
update public.industries i set slug = v.slug, headline = v.headline, models_text = v.models, description = v.descr
from (values
  ('โลจิสติกส์', 'box-truck', 'กระบะตู้ทึบอีซูซุ สำหรับงานขนส่งและกระจายสินค้า',
   'Spark Cab Chassis, Spark, Space Cab',
   E'รถกระบะอีซูซุต่อตู้ทึบสำหรับงานขนส่งและกระจายสินค้า ช่วยกันแดดกันฝน ล็อกได้ปลอดภัย และจัดเรียงสินค้าได้เป็นระเบียบ\n- เหมาะกับ: ขนส่งพัสดุ กระจายสินค้าให้ร้านค้า งานเดลิเวอรี่ในเมือง\n- เลือกได้: ขนาดและความสูงของตู้ ประตูหลัง ประตูข้าง ชั้นวางภายใน\n- รุ่นที่นิยม: Spark Cab Chassis สำหรับตู้ขนาดเต็มคัน และ Spark / Space Cab สำหรับงานที่ต้องการความคล่องตัว'),
  ('ห้องเย็น', 'cold-chain', 'D-MAX ต่อตู้เย็น ตู้ห้องเย็น อีซูซุ สำหรับสินค้าควบคุมอุณหภูมิ',
   'Spark Cab Chassis, Spark',
   E'รถกระบะอีซูซุต่อตู้เย็น (ตู้ห้องเย็น) สำหรับขนส่งสินค้าที่ต้องควบคุมอุณหภูมิ เช่น อาหารแช่แข็ง อาหารสด เครื่องดื่ม ยาและเวชภัณฑ์\n- เหมาะกับ: ร้านอาหาร ผู้ผลิตอาหาร ตัวแทนจำหน่ายไอศกรีม อาหารทะเล ผักผลไม้\n- เลือกได้: ตู้เก็บความเย็น หรือตู้พร้อมเครื่องทำความเย็น ขนาดตู้ตามปริมาณสินค้า\n- รุ่นที่นิยม: Spark Cab Chassis ช่วงยาวรองรับตู้ขนาดเต็มคัน'),
  ('ธุรกิจอาหาร', 'food-truck', 'กระบะอีซูซุ ฟู้ดทรัคและรถขนส่งอาหาร',
   'Spark Cab Chassis, Spark',
   E'รถกระบะอีซูซุสำหรับธุรกิจอาหารและเครื่องดื่ม ทั้งฟู้ดทรัคขายหน้าร้านเคลื่อนที่ และรถส่งวัตถุดิบหรือสินค้า\n- เหมาะกับ: ฟู้ดทรัค ร้านกาแฟเคลื่อนที่ ส่งอาหารและเครื่องดื่ม จัดเลี้ยงนอกสถานที่\n- เลือกได้: ตู้เปิดข้างสำหรับขาย ตู้เย็น หรือตู้ทึบสำหรับขนส่ง\n- รุ่นที่นิยม: Spark Cab Chassis สำหรับต่อตู้ขายอาหารเต็มคัน'),
  ('ก่อสร้าง', 'construction', 'กระบะอีซูซุ สำหรับงานก่อสร้างและขนวัสดุ',
   'Spark, Spark Cab Chassis, Space Cab',
   E'รถกระบะอีซูซุสำหรับงานก่อสร้างและร้านวัสดุก่อสร้าง แข็งแรง บรรทุกหนักได้ และดูแลรักษาง่าย\n- เหมาะกับ: ผู้รับเหมา ร้านวัสดุก่อสร้าง งานติดตั้ง ซ่อมบำรุง\n- เลือกได้: กระบะพื้นเรียบ (กระบะ 3 บาน) คอกเหล็ก แร็กบรรทุกท่อและเหล็กเส้น\n- รุ่นที่นิยม: Spark สำหรับงานบรรทุกทั่วไป และ Spark Cab Chassis สำหรับกระบะพื้นเรียบ'),
  ('รถคอก', 'cage', 'กระบะคอก อีซูซุ คอกเหล็ก คอกสูง',
   'Spark, Spark Cab Chassis',
   E'รถกระบะอีซูซุต่อคอกเหล็กหรือคอกสูง สำหรับบรรทุกสินค้าเกษตร ของชิ้นใหญ่ และสินค้าที่ต้องการพื้นที่บรรทุกสูง\n- เหมาะกับ: สินค้าเกษตร ผักผลไม้ ต้นไม้ ขนย้ายของ เฟอร์นิเจอร์\n- เลือกได้: คอกเหล็ก คอกสูง คอกพับข้างได้ ความสูงตามลักษณะสินค้า\n- รุ่นที่นิยม: Spark สำหรับคอกบนกระบะ และ Spark Cab Chassis สำหรับคอกพื้นเรียบ'),
  ('ค้าปลีกและ SME', 'aluminium-canopy', 'กระบะอีซูซุ หลังคาอลูมิเนียม สำหรับร้านค้าและ SME',
   'Spark, Space Cab',
   E'รถกระบะอีซูซุต่อหลังคาอลูมิเนียม สำหรับร้านค้าและธุรกิจขนาดเล็กถึงกลาง น้ำหนักเบา แข็งแรง ปกป้องสินค้าจากแดดฝน\n- เหมาะกับ: ร้านค้าส่ง-ปลีก กระจายสินค้าในชุมชน ขายของตลาดนัด\n- เลือกได้: หลังคาทรงสูง ทรงเตี้ย ประตูหลัง หน้าต่างข้าง\n- รุ่นที่นิยม: Spark และ Space Cab'),
  ('หลังคาไฟเบอร์', 'fiber-canopy', 'Spark ต่อหลังคาไฟเบอร์ อีซูซุ',
   'Spark, Space Cab',
   E'รถกระบะอีซูซุต่อหลังคาไฟเบอร์ (หลังคาสูง) สำหรับบรรทุกสินค้าที่ต้องการกันแดดกันฝน เก็บของได้มาก และดูเรียบร้อย\n- เหมาะกับ: ส่งสินค้า ขนอุปกรณ์ งานบริการนอกสถานที่\n- เลือกได้: หลังคาทรงสูง หน้าต่างข้าง ประตูหลังแบบเปิดขึ้น\n- รุ่นที่นิยม: Spark และ Space Cab')
) as v(name, slug, headline, models, descr)
where i.name = v.name and i.slug is null;
