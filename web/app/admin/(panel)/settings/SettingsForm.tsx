'use client';

import { useActionState } from 'react';
import type { SaveResult } from '@/lib/admin/crud';
import { SubmitButton, inputCls } from '@/components/admin/FormBits';
import { StatusBadge } from '@/components/admin/ui';

type Row = { key: string; label: string; group_name: string; value: string | null; status: string };

const GROUPS: Record<string, string> = { company: 'ข้อมูลบริษัท', contact: 'ช่องทางติดต่อ', social: 'โซเชียลมีเดีย', legal: 'ความเป็นส่วนตัว (PDPA)', cover: 'ภาพปกหน้าแรก', seo: 'Google / Bing / Analytics (SEO)', newmodel: 'เมนูรุ่นใหม่ / Bi-Turbo', leadnotify: 'แจ้งเตือนลูกค้าใหม่เข้า LINE' };
const HELP: Record<string, string> = {
  award_title: 'แสดงในแถบความน่าเชื่อถือทุกหน้า และส่งให้ Google / AI เช่น ความพึงพอใจ SSI อันดับ 1 (ใส่ปีจะน่าเชื่อถือขึ้น เช่น ปี 2568)',
  phone_emergency: 'ถ้าใส่ จะแสดงในแถบความน่าเชื่อถือและหน้า "ทำไมต้องเรา"',
  service_area: 'จังหวัด/พื้นที่ที่ดูแลลูกค้า คั่นด้วย , · ส่งให้ Google และ AI ใช้จับคู่คำค้น เช่น "อีซูซุ ชลบุรี"',
  line_group_default: 'เชิญบอทแจ้งเตือนเข้ากลุ่ม LINE แล้วพิมพ์ "รหัสกลุ่ม" ในกลุ่ม → บอทตอบรหัส (ขึ้นต้นด้วย C) มาวางที่นี่ · ทดสอบได้ที่หน้า Lead → ปุ่ม "ทดสอบแจ้งเตือน"',
  lead_notify_types: 'test_drive = ทดลองขับ · quote = ใบเสนอราคา · commercial = รถพาณิชย์ · launch = ลงทะเบียนรุ่นใหม่ · contact = สอบถาม (คั่นด้วย ,)',
  brand_aliases: 'ชื่ออื่นของบริษัทที่ลูกค้าใช้ค้นใน Google/AI เช่น อีซูซุกรุงเทพ, Isuzu Krungthep, IKS (คั่นด้วย ,)',
  google_site_verification: 'Google Search Console → เพิ่มพร็อพเพอร์ตี "คำนำหน้า URL" https://isuzukrungthep.com → วิธียืนยัน "แท็ก HTML" → คัดลอกเฉพาะค่าใน content="…" มาวาง',
  bing_site_verification: 'Bing Webmaster Tools → วิธียืนยัน "HTML Meta Tag" → คัดลอกเฉพาะค่าใน content="…" (หรือใช้ Import from Google แทนได้ ไม่ต้องกรอก)',
  ga4_id: 'Google Analytics 4 → ผู้ดูแลระบบ → สตรีมข้อมูล → รหัสการวัด เช่น G-AB12CD34EF · เว้นว่าง = ไม่เก็บสถิติ (มีแบนเนอร์ขอความยินยอมคุกกี้ตาม PDPA ให้อัตโนมัติ)',
  booking_url: 'ลิงก์ระบบนัดหมายเข้าศูนย์ (เช่น Google Apps Script ที่เชื่อม LINE) · ปุ่มจองนัดทุกจุดในเว็บจะพาไปที่นี่ · เว้นว่าง = ใช้ฟอร์มของเว็บ',
  booking_embed: 'on = แสดงฟอร์มจองฝังในหน้าเว็บ (ระบบปลายทางต้องอนุญาตให้ฝัง) · off = แสดงปุ่มเปิดหน้าจอง (แนะนำ)',
  cover_title: 'ภาษาอังกฤษตัวพิมพ์ใหญ่สั้นๆ ดูสวยที่สุด เช่น ISUZU IKS',
  cover_car: 'ปกติใส่ none (รูปโชว์รูมมีรถอยู่แล้ว) · ถ้าอยากวางรถด้านขวา ใส่ slug เช่น mu-x-ultimate, v-cross, x-series',
  nav_new_url: 'เช่น /biturbo · เว้นว่าง = กลับไปใช้เมนูแคมเปญ/ไลฟ์ · ระหว่างไลฟ์ เมนูจะเปลี่ยนเป็น LIVE ให้อัตโนมัติ',
  biturbo_image: 'เว้นว่างได้ · ใส่ path รูปจากคลังรูป เช่น vehicles/biturbo-engine.webp (แนะนำพื้นเข้ม กว้าง 1600px)',
  biturbo_testdrive_note: 'ข้อความใต้ปุ่มนัดทดลองขับในหน้า Bi-Turbo · เมื่อรถทดลองขับมาถึงแล้วแก้ข้อความนี้ได้',
  cover_image: 'เว้นว่าง = ใช้รูปโชว์รูมมาตรฐาน · ถ้าจะเปลี่ยนรูป ใส่ path เช่น cover/showroom-bangna.webp (แนะนำ 2400×1200)',
  line_oa_id: 'เช่น @isuzukrungthep',
  line_oa_url: 'เช่น https://lin.ee/xxxx (เว้นว่างได้ ระบบสร้างจาก LINE ID ให้)',
  phone_main: 'ใช้กับปุ่ม "โทร" บนมือถือ',
  phone_sales: 'แสดงที่แถบบนสุดของเว็บ "ฝ่ายขาย : …" (เว้นว่าง = ใช้เบอร์โทรหลัก)',
  phone_service: 'แสดงที่แถบบนสุดของเว็บ "ศูนย์บริการ : …" (เว้นว่าง = ไม่แสดง)',
  pdpa_text: 'ข้อความที่ลูกค้าต้องติ๊กยอมรับก่อนส่งฟอร์ม',
  pdpa_version: 'เปลี่ยนเลขทุกครั้งที่แก้ข้อความ PDPA เช่น v2 (บันทึกไว้กับ lead แต่ละราย)',
};

export function SettingsForm({ rows, action }: { rows: Row[]; action: (p: SaveResult, fd: FormData) => Promise<SaveResult> }) {
  const [state, formAction] = useActionState(action, { ok: false } as SaveResult);
  const groups = Object.keys(GROUPS).map((g) => ({ g, items: rows.filter((r) => r.group_name === g) })).filter((x) => x.items.length);
  return (
    <form action={formAction} className="space-y-6">
      {state.message && (
        <p role={state.ok ? 'status' : 'alert'} className={`rounded-md px-4 py-3 text-[14px] font-medium ${state.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-dark'}`}>{state.message}</p>
      )}
      {groups.map(({ g, items }) => (
        <section key={g} className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
          <h2 className="mb-4 text-[18px] font-bold">{GROUPS[g]}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((r) => {
              const long = r.key === 'pdpa_text' || r.key === 'hq_address';
              return (
                <div key={r.key} className={long ? 'sm:col-span-2' : ''}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <label htmlFor={`s-${r.key}`} className="text-[14px] font-semibold">{r.label}</label>
                    {r.status === 'sample' && <StatusBadge status="sample" />}
                  </div>
                  {long ? (
                    <textarea id={`s-${r.key}`} name={`s__${r.key}`} defaultValue={r.value ?? ''} rows={3} className={`${inputCls} resize-y`} />
                  ) : (
                    <input id={`s-${r.key}`} name={`s__${r.key}`} defaultValue={r.value ?? ''} className={inputCls} />
                  )}
                  {HELP[r.key] && <p className="mt-1 text-[12.5px] text-steel">{HELP[r.key]}</p>}
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <div className="sticky bottom-0 z-10 flex items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:rounded-[var(--radius-card)] sm:border">
        <SubmitButton className="btn btn-primary min-h-[42px] px-5 text-[15px]">บันทึกทั้งหมด</SubmitButton>
        <span className="text-[13px] text-steel">ช่องที่กรอกจะเผยแพร่บนเว็บทันทีที่บันทึก</span>
      </div>
    </form>
  );
}
