-- SSI อันดับ 1 ปี 2566 และ 2568 — แก้เฉพาะข้อความเดิมที่ยังไม่ถูกแก้ (รันซ้ำได้ ไม่ทับค่าที่แก้ในหลังบ้าน)
update public.site_settings set value = 'ความพึงพอใจ SSI อันดับ 1 ปี 2566 และ 2568'
 where key = 'award_title' and value = 'ความพึงพอใจ SSI อันดับ 1';

update public.pages set
  seo_title = 'ทำไมต้องอีซูซุกรุงเทพเซลส์ · SSI อันดับ 1 ปี 2566 และ 2568',
  seo_description = 'อีซูซุกรุงเทพเซลส์ ความพึงพอใจ SSI อันดับ 1 ปี 2566 และ 2568 เขตกรุงเทพฯ และปริมณฑล · ผู้จำหน่ายอีซูซุตั้งแต่ พ.ศ. 2525 · บริการครบวงจร · ช่วยเหลือฉุกเฉิน 24 ชม.'
 where slug = 'why' and seo_title = 'ทำไมต้องอีซูซุกรุงเทพเซลส์ · SSI อันดับ 1 กรุงเทพฯ และปริมณฑล';

update public.faqs set answer = replace(answer, '(SSI) อันดับ 1 เขต', '(SSI) อันดับ 1 ปี 2566 และ 2568 เขต')
 where group_key = 'why' and answer like '%(SSI) อันดับ 1 เขต%';
