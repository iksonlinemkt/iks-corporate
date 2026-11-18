-- ภาพปกใช้รูปโชว์รูม: ไม่วางรถซ้อน (แก้ค่าที่ v15 ตั้งไว้)
update public.site_settings set value = 'none' where key = 'cover_car' and coalesce(value, '') in ('', 'mu-x', 'mu-x-ultimate');
