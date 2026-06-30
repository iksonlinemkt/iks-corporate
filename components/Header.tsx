"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import { currentUser } from "@/lib/mockData";

export default function Header({ title }: { title?: string }) {
  return (
    <header className="h-16 bg-white border-b border-iks-border flex items-center justify-between px-6 gap-6 sticky top-0 z-10">
      <div className="font-bold text-iks-navy text-lg whitespace-nowrap">
        {title || "IKS Corporate Customer 360 & Visit App"}
      </div>
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาบริษัท, ทะเบียนรถ, เลขตัวถัง, เบอร์โทร..."
          className="w-full bg-iks-surface border border-iks-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iks-navy/20"
        />
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button className="relative text-gray-500 hover:text-iks-navy">
          <Bell size={20} />
          <span className="absolute -top-1.5 -right-1.5 bg-iks-red text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            12
          </span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className={`w-9 h-9 rounded-full ${currentUser.avatarColor} flex items-center justify-center text-white font-medium text-sm`}>
            {currentUser.name.charAt(0)}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium text-gray-800">{currentUser.name}</div>
            <div className="text-xs text-gray-400">{currentUser.role} Executive</div>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
