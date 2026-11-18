'use client';

import { useActionState } from 'react';
import { LogIn } from 'lucide-react';
import { loginAction } from '../actions';
import { SubmitButton, inputCls } from '@/components/admin/FormBits';

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, {} as { message?: string });
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[14px] font-semibold">อีเมล</label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[14px] font-semibold">รหัสผ่าน</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      {state.message && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[14px] font-medium text-red-dark">{state.message}</p>}
      <SubmitButton className="btn btn-primary w-full" pendingText="กำลังเข้าสู่ระบบ…"><LogIn size={18} />เข้าสู่ระบบ</SubmitButton>
      <p className="text-center text-[13px] text-steel">ลืมรหัสผ่าน ให้ผู้ดูแลระบบตั้งรหัสใหม่ให้ที่เมนู "ผู้ใช้งาน"</p>
    </form>
  );
}
