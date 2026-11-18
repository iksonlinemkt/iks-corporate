-- เบอร์ช่วยเหลือฉุกเฉิน 24 ชม. + พื้นที่ใกล้สาขา (ใส่เฉพาะเมื่อยังว่าง — ไม่ทับค่าที่แก้ในหลังบ้าน)
update public.site_settings set value = '061-384-6350'
 where key = 'phone_emergency' and coalesce(value, '') = '';

update public.branches set nearby = 'เทพารักษ์, บางบ่อ'
 where code in ('SR', 'BST') and coalesce(nearby, '') = '';

update public.faqs set answer = answer || ' โทร 061-384-6350'
 where group_key = 'why' and question = 'มีบริการช่วยเหลือฉุกเฉินไหม?' and answer not like '%โทร%';
