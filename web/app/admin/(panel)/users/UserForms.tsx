'use client';

import { useActionState, useState } from 'react';
import type { SaveResult } from '@/lib/admin/crud';
import { SubmitButton, TextInput, inputCls } from '@/components/admin/FormBits';

type Act = (p: SaveResult, fd: FormData) => Promise<SaveResult>;

function Msg({ s }: { s: SaveResult }) {
  if (!s.message) return null;
  return <p role={s.ok ? 'status' : 'alert'} className={`rounded-md px-3 py-2 text-[14px] font-medium ${s.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-dark'}`}>{s.message}</p>;
}

export function CreateUserForm({ action }: { action: Act }) {
  const [s, a] = useActionState(action, { ok: false } as SaveResult);
  return (
    <form action={a} className="space-y-4">
      <Msg s={s} />
      <TextInput name="email" label="อีเมล" type="email" required error={s.errors?.email} defaultValue={s.ok ? '' : s.values?.email} />
      <TextInput name="full_name" label="ชื่อ" />
      <div>
        <label htmlFor="new-role" className="mb-1.5 block text-[14px] font-semibold">สิทธิ์</label>
        <select id="new-role" name="role" defaultValue="marketing" className={inputCls}>
          <option value="marketing">การตลาด (แก้เนื้อหา + ดู Lead)</option>
          <option value="admin">ผู้ดูแลระบบ (ทั้งหมด)</option>
        </select>
      </div>
      <TextInput name="password" label="รหัสผ่านเริ่มต้น" type="text" required error={s.errors?.password} help="อย่างน้อย 10 ตัว มีตัวอักษรอังกฤษและตัวเลข" />
      <SubmitButton className="btn btn-primary min-h-[42px] px-5">สร้างบัญชี</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ action, email }: { action: Act; email: string }) {
  const [open, setOpen] = useState(false);
  const [s, a] = useActionState(action, { ok: false } as SaveResult);
  if (!open) {
    return <button type="button" onClick={() => setOpen(true)} className="mt-2 text-[13px] font-semibold text-copper-dark hover:underline">ตั้งรหัสผ่านใหม่ให้ผู้ใช้นี้</button>;
  }
  return (
    <form action={a} className="mt-3 space-y-2 rounded-md bg-mist p-3">
      <Msg s={s} />
      <label htmlFor={`pw-${email}`} className="block text-[13px] font-semibold">รหัสผ่านใหม่ของ {email}</label>
      <div className="flex gap-2">
        <input id={`pw-${email}`} name="password" type="text" required className={inputCls} />
        <SubmitButton className="btn btn-navy min-h-[44px] px-4 text-[14px]">ตั้งรหัส</SubmitButton>
      </div>
      <p className="text-[12px] text-steel">ผู้ใช้จะถูกออกจากระบบทุกเครื่อง แล้วล็อกอินด้วยรหัสใหม่</p>
    </form>
  );
}
