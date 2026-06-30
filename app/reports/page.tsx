import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Whale from "@/components/Whale";

export default function ReportsPage() {
  return (
    <AppShell>
      <Breadcrumb items={[{ label: "รายงาน" }]} />
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-16 flex flex-col items-center text-center gap-3">
        <Whale size={64} />
        <h2 className="font-semibold text-gray-700">รายงานเชิงวิเคราะห์</h2>
        <p className="text-sm text-gray-400 max-w-md">
          ฟีเจอร์รายงานลูกค้าที่มีโอกาสเปลี่ยนรถ, รถที่เข้าศูนย์บ่อย, และ Export Excel/PDF จะเปิดให้ใช้งานใน Phase 2
        </p>
      </div>
    </AppShell>
  );
}
