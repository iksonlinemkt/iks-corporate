"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Whale from "@/components/Whale";
import { User, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    // Mock auth — จะต่อกับตาราง user_profiles (username/password) ใน Supabase ภายหลัง
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-iks-navy relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-iks-copper" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-iks-navyLight" />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-6">
            <Whale size={72} />
            <h1 className="text-iks-navy font-bold text-lg mt-3">IKS Corporate Customer 360</h1>
            <p className="text-gray-400 text-xs mt-1">& Visit App — เข้าสู่ระบบ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium">ชื่อผู้ใช้</label>
              <div className="relative mt-1">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="w-full border border-iks-border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-iks-navy/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">รหัสผ่าน</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-iks-border rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none focus:ring-2 focus:ring-iks-navy/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-iks-red text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full bg-iks-copper hover:bg-iks-copperDark text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-5">
            © 2024 Isuzu Krungthep Sales Co., Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
