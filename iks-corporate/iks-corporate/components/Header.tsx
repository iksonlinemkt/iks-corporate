"use client";

import { Search, Bell } from "lucide-react";

// User info — จะเชื่อม Supabase user_profiles จริงในขั้นถัดไป
// ตอนนี้อ่านจาก sessionStorage ที่ Login page set ไว้
// ถ้ายังไม่ login → แสดง "-"
import { useEffect, useState } from "react";

export default function Header({ title }: { title?: string }) {
  const [userName, setUserName] = useState("-");
  const [userRole, setUserRole] = useState("ผู้ใช้งาน");
  const [userInitial, setUserInitial] = useState("U");

  useEffect(() => {
    // อ่านข้อมูลจาก sessionStorage ที่ Login set ไว้
    const name = sessionStorage.getItem("iks_user_name") || "";
    const role = sessionStorage.getItem("iks_user_role") || "ผู้ใช้งาน";
    if (name) {
      setUserName(name);
      setUserInitial(name.charAt(0));
    }
    setUserRole(role);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-iks-border flex items-center justify-between px-6 gap-6 sticky top-0 z-10">
      <div className="font-bold text-iks-navy text-lg whitespace-nowrap">
        {title || "IKS Corporate Customer 360 & Visit App"}
      </div>
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input type="text"
          placeholder="ค้นหาบริษัท, ทะเบียนรถ, เลขตัวถัง, เบอร์โทร..."
          className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iks-navy/20"
        />
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {/* Bell — ไม่มี badge จนกว่าจะมีระบบแจ้งเตือนจริง */}
        <button className="text-gray-400 hover:text-iks-navy">
          <Bell size={20}/>
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-iks-copper flex items-center justify-center text-white font-medium text-sm">
            {userInitial}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-gray-800">{userName}</div>
            <div className="text-xs text-gray-400">{userRole}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
