"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import { companies, getCompanyById, companySummary, currentUser } from "@/lib/mockData";
import { Truck, Gauge, Calendar, Star, Paperclip, X } from "lucide-react";

export default function CreateVisitLogPage() {
  return (
    <Suspense fallback={null}>
      <CreateVisitLogForm />
    </Suspense>
  );
}

function CreateVisitLogForm() {
  const params = useSearchParams();
  const router = useRouter();
  const preselected = params.get("company") || "";
  const [companyId, setCompanyId] = useState(preselected);
  const [submitted, setSubmitted] = useState(false);
  const company = getCompanyById(companyId);
  const summary = companyId ? companySummary(companyId) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => router.push(companyId ? `/company/${companyId}` : "/visit-log"), 900);
  }

  return (
    <AppShell>
      <Breadcrumb items={[{ label: "การเข้าเยี่ยม", href: "/visit-log" }, { label: "สร้างบันทึกการเข้าเยี่ยม" }]} />
      <h1 className="text-xl font-bold text-gray-800 mb-5">Create Visit Log — บันทึกการเข้าเยี่ยม</h1>

      {company && summary && (
        <div className="bg-white rounded-xl shadow-card border border-iks-border p-4 mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-iks-navy/10 flex items-center justify-center text-iks-navy font-bold">
              {company.name.charAt(4) || "บ"}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{company.name}</div>
              <div className="text-xs text-gray-400">เลขประจำตัวผู้เสียภาษี {company.taxId}</div>
            </div>
          </div>
          <div className="flex gap-5 text-sm">
            <MiniStat icon={<Truck size={15} />} value={`${summary.totalVehicles} คัน`} label="รถทั้งหมด" />
            <MiniStat icon={<Calendar size={15} />} value={summary.lastVisitDate || "-"} label="เข้าเยี่ยมล่าสุด" />
            <MiniStat icon={<Star size={15} />} value={company.opportunityLevel} label="ระดับลูกค้า" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="ข้อมูลการเข้าเยี่ยม">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="บริษัท" required full>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="form-input"
                required
              >
                <option value="">-- เลือกบริษัท --</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="วันที่เข้าเยี่ยม" required>
              <input type="date" className="form-input" required />
            </FormField>
            <FormField label="เวลา" required>
              <input type="time" className="form-input" required />
            </FormField>
            <FormField label="ผู้เข้าเยี่ยม" required>
              <select className="form-input" defaultValue={currentUser.name} required>
                <option>{currentUser.name}</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FormField label="ผู้ที่พบ" required>
              <input type="text" placeholder="ชื่อผู้ที่พบ" className="form-input" required />
            </FormField>
            <FormField label="ตำแหน่งผู้ที่พบ" required>
              <input type="text" placeholder="เช่น ผู้จัดการฝ่ายจัดซื้อ" className="form-input" required />
            </FormField>
            <FormField label="วัตถุประสงค์การเข้าเยี่ยม" required>
              <select className="form-input" required>
                <option value="">-- เลือก --</option>
                <option>แนะนำสินค้า / ติดตามการใช้งาน</option>
                <option>นัดหมายเสนอราคา</option>
                <option>ติดตามการซ่อม</option>
                <option>ต่ออายุสัญญาบริการ</option>
                <option>แนะนำรถรุ่นใหม่</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="รายละเอียดการเข้าเยี่ยม">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="สรุปการพูดคุย" required full>
              <textarea rows={2} className="form-input" placeholder="สรุปประเด็นที่พูดคุยกับลูกค้า" required />
            </FormField>
            <FormField label="ความต้องการของลูกค้า" required full>
              <textarea rows={2} className="form-input" placeholder="ความต้องการ / ปัญหาที่ลูกค้าแจ้ง" required />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <FormField label="รุ่นที่สนใจ">
              <select className="form-input">
                <option value="">-- เลือก --</option>
                <option>ISUZU D-MAX</option>
                <option>ISUZU MU-X</option>
                <option>ISUZU FTR 240</option>
                <option>ISUZU FXZ 360</option>
              </select>
            </FormField>
            <FormField label="จำนวนที่คาดว่าจะซื้อ">
              <input type="number" min={0} className="form-input" placeholder="คัน" />
            </FormField>
            <FormField label="ช่วงเวลาที่คาดว่าจะซื้อ">
              <select className="form-input">
                <option value="">-- เลือก --</option>
                <option>ไตรมาสนี้</option>
                <option>ไตรมาสถัดไป</option>
                <option>ภายใน 6 เดือน</option>
                <option>ภายใน 1 ปี</option>
              </select>
            </FormField>
            <FormField label="คู่แข่งที่พิจารณา">
              <input type="text" placeholder="เช่น Hino, Fuso" className="form-input" />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="ผลการเข้าเยี่ยม" required>
              <select className="form-input" required>
                <option value="">-- เลือก --</option>
                <option>นัดหมายสำเร็จ</option>
                <option>สนใจรับใบเสนอราคา</option>
                <option>สนใจเปลี่ยนรถ</option>
                <option>รอติดตาม</option>
                <option>ยังไม่พร้อม</option>
                <option>ส่งต่อฝ่ายบริการ</option>
                <option>ปิดโอกาส</option>
              </select>
            </FormField>
            <FormField label="ระดับโอกาส" required>
              <select className="form-input" required>
                <option value="">-- เลือก --</option>
                <option>HOT</option>
                <option>WARM</option>
                <option>COLD</option>
                <option>NONE</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="งานติดตามและการดำเนินการ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="งานที่ต้องทำต่อ" required full>
              <input type="text" placeholder="เช่น จัดทำใบเสนอราคา" className="form-input" required />
            </FormField>
            <FormField label="ผู้รับผิดชอบ" required>
              <select className="form-input" defaultValue={currentUser.name} required>
                <option>{currentUser.name}</option>
              </select>
            </FormField>
            <FormField label="วันติดตามครั้งถัดไป" required>
              <input type="date" className="form-input" required />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="เอกสารและหมายเหตุ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="แนบรูปหรือเอกสาร">
              <div className="border-2 border-dashed border-iks-border rounded-lg p-6 flex flex-col items-center text-gray-400 text-sm gap-1">
                <Paperclip size={20} />
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์ (JPG, PNG, PDF ขนาดไม่เกิน 10MB)
              </div>
            </FormField>
            <FormField label="หมายเหตุภายใน">
              <textarea rows={4} className="form-input" placeholder="ระบุหมายเหตุภายใน (เฉพาะทีมงานเห็นเท่านั้น)" />
            </FormField>
          </div>
        </FormSection>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg border border-iks-border text-gray-600 text-sm hover:bg-iks-surface">
            ยกเลิก
          </button>
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-iks-navy hover:bg-iks-navyLight text-white text-sm font-medium">
            {submitted ? "บันทึกเรียบร้อย ✓" : "บันทึก"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .form-input {
          width: 100%;
          background: #f4f6fa;
          border: 1px solid #e2e6ed;
          border-radius: 0.5rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .form-input:focus {
          box-shadow: 0 0 0 2px rgba(11, 45, 107, 0.15);
        }
      `}</style>
    </AppShell>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
      <h3 className="font-semibold text-iks-navy text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

function FormField({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? "md:col-span-2 lg:col-span-4" : ""}>
      <label className="text-xs text-gray-500 font-medium mb-1 block">
        {label} {required && <span className="text-iks-red">*</span>}
      </label>
      {children}
    </div>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-iks-navy">{icon}</div>
      <div>
        <div className="font-semibold text-gray-800 text-sm leading-tight">{value}</div>
        <div className="text-[11px] text-gray-400">{label}</div>
      </div>
    </div>
  );
}
