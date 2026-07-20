import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";

export default function SettingsPage() {
  return (
    <AppShell>
      <Breadcrumb items={[{ label: "ตั้งค่า" }]} />
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-6 max-w-xl">
        <h2 className="font-semibold text-gray-800 mb-4">ตั้งค่าระบบ</h2>
        <div className="space-y-3 text-sm text-gray-500">
          <p>• จัดการผู้ใช้และสิทธิ์ (Sales / Service Advisor / Manager / Admin)</p>
          <p>• จัดการสาขา</p>
          <p>• Import & Match Review (สำหรับ Admin)</p>
          <p className="text-xs text-gray-400 pt-2">ฟีเจอร์เหล่านี้จะเชื่อมกับ Supabase ในขั้นถัดไป</p>
        </div>
      </div>
    </AppShell>
  );
}
