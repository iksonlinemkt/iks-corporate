import AppShell from "@/components/AppShell";
import Breadcrumb from "@/components/Breadcrumb";
import Whale from "@/components/Whale";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function VisitLogListPage() {
  return (
    <AppShell>
      <Breadcrumb items={[{ label: "การเข้าเยี่ยม" }]} />
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-800">การเข้าเยี่ยม</h1>
        <Link href="/visit-log/new" className="flex items-center gap-1.5 bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-3.5 py-2 text-sm">
          <Plus size={15}/> บันทึกการเข้าเยี่ยมใหม่
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-12 flex flex-col items-center gap-3">
        <Whale size={64}/>
        <h3 className="font-semibold text-gray-700">ยังไม่มีประวัติการเข้าเยี่ยม</h3>
        <p className="text-sm text-gray-400 text-center max-w-md">
          ประวัติการเข้าเยี่ยมจะแสดงที่นี่เมื่อมีการบันทึกผลการเข้าเยี่ยมลูกค้า
          ข้อมูลนี้จะเชื่อมต่อกับ Supabase ในขั้นตอนถัดไป
        </p>
        <Link href="/visit-log/new" className="mt-2 bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg px-4 py-2 text-sm">
          + บันทึกการเข้าเยี่ยม
        </Link>
      </div>
    </AppShell>
  );
}
