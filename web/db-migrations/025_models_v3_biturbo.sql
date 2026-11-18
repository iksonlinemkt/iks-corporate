-- รุ่นรถชุด v3 (24 ต.ค. 2569): ราคาตาม isuzu-tis.com + เครื่องยนต์ใหม่ 2.2 Ddi MAXFORCE Biturbo
-- ทำครั้งเดียว (บันทึกใน data_versions) ติดตั้งเว็บรอบต่อไปจะไม่ทับราคาที่แก้ในหลังบ้าน
create table if not exists public.data_versions (key text primary key, applied_at timestamptz not null default now());
do $do$
begin
  if exists (select 1 from public.data_versions where key = 'models_v3') then return; end if;
  if not exists (select 1 from public.vehicles where slug = 'v-cross') then return; end if;
  update public.vehicles set tagline = 'กระบะตอนเดียว คุ้มค่า พร้อมลุยงาน', description = 'ISUZU SPARK กระบะตอนเดียว คุ้มค่า พร้อมลุยงาน
  
  เหมาะกับงานบรรทุกทั่วไป ร้านค้า และธุรกิจที่ต้องการต่อคอกหรือต่อหลังคา
  
  ราคาแนะนำเริ่มต้น 598,000 บาท ถึง 783,000 บาท (6 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร และ 3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 598000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที / 3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2) / 4 ล้อ (4x4)","จำนวนรุ่นย่อย":"6 รุ่น","ช่วงราคาแนะนำ":"598,000 – 783,000 บาท"}'::jsonb, is_featured = true, updated_at = now() where slug = 'spark';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'spark');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('Spark 2.2 Ddi B', 598000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', null, 'เบาะไวนิล · วิทยุ 1-DIN', 10),
    ('Spark 2.2 Ddi S', 631000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'เบาะไวนิล · จอสัมผัส 8 นิ้ว', 20),
    ('Spark 2.2 Ddi S A/T', 675000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'เบาะไวนิล · จอสัมผัส 8 นิ้ว', 30),
    ('Spark 3.0 Ddi S', 651000, '3.0 Ddi (4JJ3-TCX)', '190 แรงม้า', '450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'เบาะไวนิล · จอสัมผัส 8 นิ้ว', 40),
    ('Spark 3.0 Ddi S 4x4', 743000, '3.0 Ddi (4JJ3-TCX)', '190 แรงม้า', '450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที', 'เกียร์ธรรมดา', '4x4', 'ล้อเหล็ก 16 นิ้ว', '8 นิ้ว', 'ขับเคลื่อน 4 ล้อ · จอสัมผัส 8 นิ้ว', 50),
    ('Spark 3.0 Ddi S 4x4 A/T', 783000, '3.0 Ddi (4JJ3-TCX)', '190 แรงม้า', '450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x4', 'ล้อเหล็ก 16 นิ้ว', '8 นิ้ว', 'ขับเคลื่อน 4 ล้อ · จอสัมผัส 8 นิ้ว', 60)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'spark';
  update public.vehicles set tagline = 'แชสซีเปล่า พร้อมต่อตู้และตัวถังตามธุรกิจ', description = 'ISUZU SPARK CAB CHASSIS แชสซีเปล่า พร้อมต่อตู้และตัวถังตามธุรกิจ
  
  เหมาะกับการต่อตู้ทึบ ตู้เย็น ฟู้ดทรัค หรือตัวถังเฉพาะงาน มีรุ่นเตรียมต่อตู้เย็น (Refrigerator) ทั้งเกียร์ธรรมดาและอัตโนมัติ และรุ่นเครื่อง 3.0
  
  ราคาแนะนำเริ่มต้น 558,000 บาท ถึง 602,000 บาท (4 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร และ 3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 558000, badge = 'ต่อตู้ได้',
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที / 3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"4 รุ่น","ช่วงราคาแนะนำ":"558,000 – 602,000 บาท"}'::jsonb, is_featured = true, updated_at = now() where slug = 'spark-cab-chassis';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'spark-cab-chassis');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('Spark 2.2 Ddi B Cab Chassis', 558000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', null, 'แชสซีเปล่า พร้อมต่อตัวถัง', 10),
    ('Spark 2.2 Ddi B Cab Chassis (Refrigerator)', 563000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', null, 'รุ่นสำหรับต่อตู้เย็น', 20),
    ('Spark 2.2 Ddi B Cab Chassis (Refrigerator) A/T', 602000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้อเหล็ก 15 นิ้ว', null, 'รุ่นสำหรับต่อตู้เย็น · เกียร์อัตโนมัติ', 30),
    ('Spark 3.0 Ddi B Cab Chassis', null::numeric, '3.0 Ddi (4JJ3-TCX)', '190 แรงม้า', '450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', null, 'แชสซีเปล่า เครื่อง 3.0 สำหรับงานบรรทุกหนัก', 40)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'spark-cab-chassis';
  update public.vehicles set tagline = 'กระบะพื้นเรียบ (Flat Deck) บรรทุกของชิ้นใหญ่สะดวก', description = 'ISUZU SPARK กระบะ 3 บาน กระบะพื้นเรียบ (Flat Deck) บรรทุกของชิ้นใหญ่สะดวก
  
  เหมาะกับงานขนวัสดุก่อสร้าง สินค้าเกษตร และของชิ้นใหญ่
  
  ราคาแนะนำ 692,000 บาท (1 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร มีให้เลือกเกียร์ธรรมดา
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 692000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที","ระบบส่งกำลัง":"เกียร์ธรรมดา","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"1 รุ่น","ช่วงราคาแนะนำ":"692,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'spark-flat-deck';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'spark-flat-deck');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('Spark 2.2 Ddi B FLAT DECK (SWB)', 692000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', null, 'กระบะพื้นเรียบ ฐานล้อสั้น (SWB)', 10)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'spark-flat-deck';
  update public.vehicles set tagline = 'กระบะแคป ห้องโดยสารกว้าง ใช้งานคุ้มค่า', description = 'ISUZU D-MAX SPACE CAB กระบะแคป ห้องโดยสารกว้าง ใช้งานคุ้มค่า
  
  เหมาะกับใช้งานทั่วไปและธุรกิจขนาดเล็กที่ต้องการพื้นที่เก็บของหลังเบาะ
  
  ราคาแนะนำเริ่มต้น 675,000 บาท ถึง 784,000 บาท (5 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร และ 3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 675000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที / 3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"5 รุ่น","ช่วงราคาแนะนำ":"675,000 – 784,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'space-cab';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'space-cab');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('Spacecab 2.2 Ddi S', 675000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง · เบาะผ้า', 10),
    ('Spacecab 2.2 Ddi S A/T', 719000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง · เบาะผ้า', 20),
    ('Spacecab 3.0 Ddi S', null::numeric, '3.0 Ddi (4JJ3-TCX)', '190 แรงม้า', '450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง · เบาะผ้า', 30),
    ('Spacecab 2.2 Ddi L', 740000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอย 16 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 40),
    ('Spacecab 2.2 Ddi L A/T', 784000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 16 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 50)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'space-cab';
  update public.vehicles set tagline = 'กระบะแคปยกสูง แข็งแกร่ง พร้อมทุกเส้นทาง', description = 'ISUZU D-MAX SPACE CAB HI-LANDER กระบะแคปยกสูง แข็งแกร่ง พร้อมทุกเส้นทาง
  
  เหมาะกับผู้ที่ต้องการกระบะแคปทรงยกสูง ใช้งานได้ทั้งในเมืองและต่างจังหวัด
  
  ราคาแนะนำเริ่มต้น 781,000 บาท ถึง 888,000 บาท (4 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 781000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"4 รุ่น","ช่วงราคาแนะนำ":"781,000 – 888,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'space-cab-hi-lander';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'space-cab-hi-lander');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('Hi-Lander 2.2 Ddi L', 781000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอย 17 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 10),
    ('Hi-Lander 2.2 Ddi L A/T', 825000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 17 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 20),
    ('Hi-Lander 2.2 Ddi Z', 844000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอย 17 นิ้ว', '8 นิ้ว', 'เบาะหนังสังเคราะห์ COOLMAX', 30),
    ('Hi-Lander 2.2 Ddi Z A/T', 888000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 17 นิ้ว', '9 นิ้ว', 'กล้อง 360 องศา 3D · เบาะหนังสังเคราะห์ COOLMAX', 40)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'space-cab-hi-lander';
  update public.vehicles set tagline = 'กระบะ 4 ประตู นั่งสบายทั้งครอบครัว', description = 'ISUZU D-MAX CAB4 กระบะ 4 ประตู นั่งสบายทั้งครอบครัว
  
  เหมาะกับครอบครัวและธุรกิจที่ต้องการทั้งที่นั่ง 5 คนและกระบะบรรทุก
  
  ราคาแนะนำเริ่มต้น 756,000 บาท ถึง 946,000 บาท (5 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 756000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"5 รุ่น","ช่วงราคาแนะนำ":"756,000 – 946,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'cab4';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'cab4');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('Cab4 2.2 Ddi S', 756000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง · เบาะผ้า', 10),
    ('Cab4 2.2 Ddi S A/T', 800000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้อเหล็ก 15 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง · เบาะผ้า', 20),
    ('Cab4 2.2 Ddi L', 836000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอย 16 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 30),
    ('Cab4 2.2 Ddi L A/T', 880000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 16 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 40),
    ('Cab4 2.2 Ddi Z A/T', 946000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอยทูโทน 16 นิ้ว', '8 นิ้ว', 'เบาะหนังสังเคราะห์ COOLMAX', 50)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'cab4';
  update public.vehicles set tagline = 'กระบะ 4 ประตูยกสูง ครบทั้งความสบายและความแกร่ง', description = 'ISUZU D-MAX CAB4 HI-LANDER กระบะ 4 ประตูยกสูง ครบทั้งความสบายและความแกร่ง
  
  เหมาะกับครอบครัวและการเดินทางไกล มีรุ่นเครื่องยนต์ใหม่ 2.2 Bi-Turbo 204 แรงม้า และกล้องรอบคัน 360 องศา
  
  ราคาแนะนำเริ่มต้น 888,000 บาท ถึง 1,194,000 บาท (6 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร และ 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 888000, badge = 'BI-TURBO',
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที / 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ / เกียร์อัตโนมัติ 8 สปีด","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"6 รุ่น","ช่วงราคาแนะนำ":"888,000 – 1,194,000 บาท"}'::jsonb, is_featured = true, updated_at = now() where slug = 'cab4-hi-lander';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'cab4-hi-lander');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('Hi-Lander 2.2 Ddi L', 888000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอย 17 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 10),
    ('Hi-Lander 2.2 Ddi L A/T', 927000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 17 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะผ้าพรีเมียม', 20),
    ('Hi-Lander 2.2 Ddi Z', 955000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอย 18 นิ้ว', '8 นิ้ว', 'เบาะหนังสังเคราะห์ COOLMAX', 30),
    ('Hi-Lander 2.2 Ddi Z A/T', 994000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 18 นิ้ว', '8 นิ้ว', 'เบาะหนังสังเคราะห์ COOLMAX', 40),
    ('Hi-Lander 2.2 Ddi M A/T', 1160000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอยทูโทน 18 นิ้ว', '9 นิ้ว', 'กล้อง 360 องศา 3D · เบาะหนังสังเคราะห์ COOLMAX', 50),
    ('Hi-Lander 2.2 Ddi Biturbo M A/T', 1194000, '2.2 Ddi MAXFORCE Biturbo', '204 แรงม้า', '500 นิวตันเมตร', 'เกียร์อัตโนมัติ 8 สปีด', '4x2', 'ล้ออัลลอยทูโทน 18 นิ้ว', '9 นิ้ว', 'เครื่องยนต์ใหม่ Bi-Turbo · กล้อง 360 องศา 3D · เบาะหนังสังเคราะห์ COOLMAX', 60)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'cab4-hi-lander';
  update public.vehicles set tagline = 'ใหม่! เครื่อง 2.2 Bi-Turbo 204 แรงม้า ขับเคลื่อน 4 ล้อ', description = 'ISUZU D-MAX V-CROSS 4x4 ใหม่! เครื่อง 2.2 Bi-Turbo 204 แรงม้า ขับเคลื่อน 4 ล้อ
  
  เหมาะกับงานที่ต้องขึ้นเขา ลุยทางดิน และการเดินทางแบบออฟโรด มีรุ่นเครื่องยนต์ใหม่ 2.2 Ddi MAXFORCE Bi-Turbo 204 แรงม้า 500 นิวตันเมตร
  
  ราคาแนะนำเริ่มต้น 940,000 บาท ถึง 1,312,000 บาท (4 รุ่นย่อย) เครื่องยนต์ 3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร และ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร และ 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 940000, badge = 'BI-TURBO',
    specs = '{"เครื่องยนต์":"3.0 Ddi (4JJ3-TCX) 190 แรงม้า 450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที / 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที / 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ / เกียร์อัตโนมัติ 8 สปีด","ระบบขับเคลื่อน":"4 ล้อ (4x4)","จำนวนรุ่นย่อย":"4 รุ่น","ช่วงราคาแนะนำ":"940,000 – 1,312,000 บาท"}'::jsonb, is_featured = true, updated_at = now() where slug = 'v-cross';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'v-cross');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('V-Cross 3.0 Ddi Z 2-door', 940000, '3.0 Ddi (4JJ3-TCX)', '190 แรงม้า', '450 นิวตันเมตร @ 1,600–2,600 รอบ/นาที', 'เกียร์ธรรมดา', '4x4', 'ล้ออัลลอย 18 นิ้ว', '8 นิ้ว', 'กล้อง 360 องศา 3D · เบาะหนังสังเคราะห์ COOLMAX', 10),
    ('V-Cross 2.2 Ddi Z 4-door A/T', 1069000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x4', 'ล้ออัลลอย 18 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline · เบาะหนังสังเคราะห์ COOLMAX', 20),
    ('V-Cross 2.2 Ddi Biturbo Z 4-door', 1064000, '2.2 Ddi MAXFORCE Biturbo', '204 แรงม้า', '500 นิวตันเมตร', 'เกียร์ธรรมดา', '4x4', 'ล้ออัลลอย 18 นิ้ว', '8 นิ้ว', 'เครื่องยนต์ใหม่ Bi-Turbo · กล้อง 360 องศา 3D · เบาะหนังสังเคราะห์ COOLMAX', 30),
    ('V-Cross 2.2 Ddi Biturbo M 4-door A/T', 1312000, '2.2 Ddi MAXFORCE Biturbo', '204 แรงม้า', '500 นิวตันเมตร', 'เกียร์อัตโนมัติ 8 สปีด', '4x4', 'ล้ออัลลอยดำด้าน 18 นิ้ว', '9 นิ้ว', 'เครื่องยนต์ใหม่ Bi-Turbo · กล้อง 360 องศา 3D · เบาะหนัง COOLMAX ทูโทน', 40)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'v-cross';
  update public.vehicles set tagline = 'สไตล์ที่ใช่...ตัวตนที่ชัดเจน', description = 'ISUZU D-MAX X-SERIES สไตล์ที่ใช่...ตัวตนที่ชัดเจน
  
  เหมาะกับผู้ที่ต้องการกระบะดีไซน์สปอร์ต มีทั้งรุ่น Speed และ Hi-Lander
  
  ราคาแนะนำเริ่มต้น 771,000 บาท ถึง 1,044,000 บาท (4 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร มีให้เลือกเกียร์ธรรมดาและเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 771000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที","ระบบส่งกำลัง":"เกียร์ธรรมดา / เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"4 รุ่น","ช่วงราคาแนะนำ":"771,000 – 1,044,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'x-series';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'x-series');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('X-Series 2.2 Ddi Speed 2-door', 771000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอยดำเงา 16 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline', 10),
    ('X-Series 2.2 Ddi Speed 4-door', 867000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอยดำเงา 16 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง Dynamic Guideline', 20),
    ('X-Series 2.2 Ddi Hi-Lander 4-door', 1005000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์ธรรมดา', '4x2', 'ล้ออัลลอยดำเงา 18 นิ้ว', '8 นิ้ว', 'กล้อง 360 องศา 3D · เบาะหนังสังเคราะห์ COOLMAX', 30),
    ('X-Series 2.2 Ddi Hi-Lander 4-door A/T', 1044000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอยดำเงา 18 นิ้ว', '8 นิ้ว', 'กล้อง 360 องศา 3D · เบาะหนังสังเคราะห์ COOLMAX', 40)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'x-series';
  update public.vehicles set tagline = 'PPV 7 ที่นั่ง คุ้มค่าเริ่มต้น', description = 'ISUZU MU-X ACTIVE PPV 7 ที่นั่ง คุ้มค่าเริ่มต้น
  
  รถอเนกประสงค์ 7 ที่นั่งสำหรับครอบครัว
  
  ราคาแนะนำ 1,197,000 บาท (1 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร มีให้เลือกเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 1197000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที","ระบบส่งกำลัง":"เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"1 รุ่น","ช่วงราคาแนะนำ":"1,197,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'mu-x-active';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'mu-x-active');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('MU-X 2.2 Ddi Active A/T', 1197000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 17 นิ้ว', '8 นิ้ว', 'กล้องมองหลัง · เบาะผ้า', 10)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'mu-x-active';
  update public.vehicles set tagline = 'ความหรูหราที่ลงตัว', description = 'ISUZU MU-X ELEGANT ความหรูหราที่ลงตัว
  
  รถอเนกประสงค์ 7 ที่นั่ง เบาะหนังสีน้ำตาล Truffle Brown มีรุ่นเครื่องยนต์ใหม่ 2.2 Bi-Turbo 204 แรงม้า
  
  ราคาแนะนำเริ่มต้น 1,432,000 บาท ถึง 1,474,000 บาท (2 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร และ 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร มีให้เลือกเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 1432000, badge = 'BI-TURBO',
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที / 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร","ระบบส่งกำลัง":"เกียร์อัตโนมัติ / เกียร์อัตโนมัติ 8 สปีด","ระบบขับเคลื่อน":"2 ล้อ (4x2)","จำนวนรุ่นย่อย":"2 รุ่น","ช่วงราคาแนะนำ":"1,432,000 – 1,474,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'mu-x-elegant';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'mu-x-elegant');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('MU-X 2.2 Ddi Elegant A/T', 1432000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 18 นิ้ว', '9 นิ้ว', 'กล้อง 360 องศา 3D · เบาะหนัง COOLMAX Truffle Brown', 10),
    ('MU-X 2.2 Ddi Biturbo Elegant A/T', 1474000, '2.2 Ddi MAXFORCE Biturbo', '204 แรงม้า', '500 นิวตันเมตร', 'เกียร์อัตโนมัติ 8 สปีด', '4x2', 'ล้ออัลลอย 18 นิ้ว', '9 นิ้ว', 'เครื่องยนต์ใหม่ Bi-Turbo · กล้อง 360 องศา 3D · เบาะหนัง COOLMAX Truffle Brown', 20)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'mu-x-elegant';
  update public.vehicles set tagline = 'ที่สุดของความพรีเมียม', description = 'ISUZU MU-X ULTIMATE ที่สุดของความพรีเมียม
  
  รถอเนกประสงค์ 7 ที่นั่งรุ่นท็อป มีทั้งขับเคลื่อน 2 ล้อและ 4 ล้อ
  
  ราคาแนะนำเริ่มต้น 1,557,000 บาท ถึง 1,657,000 บาท (2 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร มีให้เลือกเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 1557000, badge = null,
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที","ระบบส่งกำลัง":"เกียร์อัตโนมัติ","ระบบขับเคลื่อน":"2 ล้อ (4x2) / 4 ล้อ (4WD)","จำนวนรุ่นย่อย":"2 รุ่น","ช่วงราคาแนะนำ":"1,557,000 – 1,657,000 บาท"}'::jsonb, is_featured = false, updated_at = now() where slug = 'mu-x-ultimate';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'mu-x-ultimate');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('MU-X 2.2 Ddi Ultimate A/T', 1557000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอย 20 นิ้ว', '9 นิ้ว', 'กล้อง 360 องศา 3D', 10),
    ('MU-X 2.2 Ddi Ultimate 4WD A/T', 1657000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4WD', 'ล้ออัลลอย 20 นิ้ว', '9 นิ้ว', 'กล้อง 360 องศา 3D · ขับเคลื่อน 4 ล้อ', 20)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'mu-x-ultimate';
  update public.vehicles set tagline = 'สปอร์ตพรีเมียม เหนือทุกระดับ', description = 'ISUZU MU-X RS สปอร์ตพรีเมียม เหนือทุกระดับ
  
  รถอเนกประสงค์ 7 ที่นั่งสไตล์สปอร์ต มีเครื่อง 2.2 และเครื่องยนต์ใหม่ 2.2 Bi-Turbo 204 แรงม้า ทั้งขับเคลื่อน 2 ล้อและ 4 ล้อ
  
  ราคาแนะนำเริ่มต้น 1,627,000 บาท ถึง 1,774,000 บาท (4 รุ่นย่อย) เครื่องยนต์ 2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร และ 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร มีให้เลือกเกียร์อัตโนมัติ
  
  จองทดลองขับหรือขอใบเสนอราคาได้ที่อีซูซุกรุงเทพเซลส์ สาขาบางนา ศรีนครินทร์ บางเสาธง และเกษตร', price_from = 1627000, badge = 'BI-TURBO',
    specs = '{"เครื่องยนต์":"2.2 Ddi MAXFORCE (RZ4F-TC) 163 แรงม้า 400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที / 2.2 Ddi MAXFORCE Biturbo 204 แรงม้า 500 นิวตันเมตร","ระบบส่งกำลัง":"เกียร์อัตโนมัติ / เกียร์อัตโนมัติ 8 สปีด","ระบบขับเคลื่อน":"2 ล้อ (4x2) / 4 ล้อ (4WD)","จำนวนรุ่นย่อย":"4 รุ่น","ช่วงราคาแนะนำ":"1,627,000 – 1,774,000 บาท"}'::jsonb, is_featured = true, updated_at = now() where slug = 'mu-x-rs';
  delete from public.vehicle_grades where vehicle_id = (select id from public.vehicles where slug = 'mu-x-rs');
  insert into public.vehicle_grades (vehicle_id, name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order)
  select v.id, x.* from public.vehicles v, (values
    ('MU-X 2.2 Ddi RS A/T', 1627000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4x2', 'ล้ออัลลอยดำเงา 20 นิ้ว', '9 นิ้ว', 'กล้อง 360 องศา 3D · เบาะหนัง COOLMAX', 10),
    ('MU-X 2.2 Ddi RS 4WD A/T', 1727000, '2.2 Ddi MAXFORCE (RZ4F-TC)', '163 แรงม้า', '400 นิวตันเมตร @ 1,600–2,400 รอบ/นาที', 'เกียร์อัตโนมัติ', '4WD', 'ล้ออัลลอยดำเงา 20 นิ้ว', '9 นิ้ว', 'กล้อง 360 องศา 3D · ขับเคลื่อน 4 ล้อ', 20),
    ('MU-X 2.2 Ddi Biturbo RS A/T', 1674000, '2.2 Ddi MAXFORCE Biturbo', '204 แรงม้า', '500 นิวตันเมตร', 'เกียร์อัตโนมัติ 8 สปีด', '4x2', 'ล้ออัลลอยดำเงา 20 นิ้ว', '9 นิ้ว', 'เครื่องยนต์ใหม่ Bi-Turbo · กล้อง 360 องศา 3D · เบาะหนัง COOLMAX', 30),
    ('MU-X 2.2 Ddi Biturbo RS 4WD A/T', 1774000, '2.2 Ddi MAXFORCE Biturbo', '204 แรงม้า', '500 นิวตันเมตร', 'เกียร์อัตโนมัติ 8 สปีด', '4WD', 'ล้ออัลลอยดำเงา 20 นิ้ว', '9 นิ้ว', 'เครื่องยนต์ใหม่ Bi-Turbo · กล้อง 360 องศา 3D · ขับเคลื่อน 4 ล้อ', 40)
  ) as x(name, price, engine, power, torque, transmission, drive, wheels, screen, features, sort_order) where v.slug = 'mu-x-rs';
  insert into public.data_versions (key) values ('models_v3');
end
$do$;
