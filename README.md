# IKS Corporate Customer 360 & Visit App (iks-corporate)

ระบบข้อมูลลูกค้านิติบุคคล การเข้าเยี่ยม และประวัติรถ — Phase 1 (UI + Mock Data)

## วิธีรัน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 (จะ redirect ไปหน้า /login อัตโนมัติ — กรอก username/password อะไรก็ได้เพื่อเข้าระบบในเวอร์ชัน mock นี้)

## โครงสร้างหน้า (Phase 1 — 8 หน้าหลัก)

| หน้า | Path |
|---|---|
| Login | `/login` |
| Dashboard | `/dashboard` |
| ลูกค้าที่ซื้อรถ | `/customers/purchased` |
| ลูกค้าที่ซ่อมรถ | `/customers/serviced` |
| บริษัท / ข้อมูลลูกค้า (list) | `/company` |
| Company Detail / Customer 360 | `/company/[id]` (6 tabs: ภาพรวม, ข้อมูลบริษัท, รถของบริษัท, ประวัติการเข้าศูนย์, ประวัติการเข้าเยี่ยม, งานติดตาม) |
| รถของบริษัท (list ทั้งหมด) | `/vehicles` |
| Vehicle Detail | `/company/[id]/vehicle/[vehicleId]` |
| ประวัติการเข้าศูนย์ (list ทั้งหมด) | `/service-history` |
| การเข้าเยี่ยม (list) | `/visit-log` |
| Create Visit Log | `/visit-log/new` (รองรับ `?company=C0001` เพื่อ preselect บริษัท) |
| งานติดตาม | `/follow-up` |
| Customer View / Presentation Mode | `/customer-view/[id]` (ไม่มี sidebar เปิดให้ลูกค้าดูได้) |
| รายงาน, ตั้งค่า | `/reports`, `/settings` (stub สำหรับ Phase 2) |

## ข้อมูล (Mock Data)

ข้อมูลทั้งหมดอยู่ใน `lib/mockData.ts` — generate แบบ deterministic (seed คงที่) จำลองบริษัท ~15 บริษัท, รถ, ประวัติซ่อม, ประวัติเข้าเยี่ยม, งานติดตาม ตามโครงสร้าง schema ที่วางไว้ (companies, vehicles, service_records, visit_logs, follow_up_tasks)

Type definitions อยู่ใน `lib/types.ts` ตรงกับ database schema ที่ออกแบบไว้ รวมฟิลด์ `vehicleGroup` (P-UP / MU-X / รถบรรทุก / อื่นๆ) และ `vehicleSubtype` (STD, SPC NR, SPC HR, Cab4 NR, Cab4 HR) สำหรับกลุ่ม P-UP

## Login

ตอนนี้เป็น mock form (username/password แบบเดียวกับระบบเดิม ไม่ใช้ Supabase Auth) ยังไม่ผูกกับฐานข้อมูลจริง — เมื่อพร้อมต่อ Supabase จะเชื่อมกับตาราง `user_profiles`

## ขั้นตอนถัดไป (ตามที่คุยกันไว้)

1. สร้าง Supabase project ใหม่ (แยกจากระบบเดิม) ตาม schema ที่ออกแบบไว้
2. ทำระบบ Import Excel (ใช้ template ที่ทำไว้) + Data Match Review
3. เปลี่ยนจาก mock data ใน `lib/mockData.ts` เป็น Supabase queries จริง
4. ทำ Login จริงผ่าน `user_profiles` table + role-based access (Sales / Service Advisor / Manager / Admin) + กรองสิทธิ์ตามสาขา
5. เพิ่ม Phase 2 features (รายงานเชิงวิเคราะห์, Export, แจ้งเตือน)

## Design System

- สี: น้ำเงินเข้ม `#0B2D6B` (Header/Sidebar) + Copper `#C2703D` (ปุ่ม Primary)
- ฟอนต์: IBM Plex Sans Thai / Sarabun
- มาสคอตวาฬ: `components/Whale.tsx` (SVG ปรับขนาดได้ ใช้ใน Sidebar, Dashboard widget, Empty state, Login)
