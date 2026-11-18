'use client';

import { useActionState } from 'react';
import type { SaveResult } from '@/lib/admin/crud';
import { SubmitButton, TextInput } from '@/components/admin/FormBits';

export function PasswordForm({ action }: { action: (p: SaveResult, fd: FormData) => Promise<SaveResult> }) {
  const [s, a] = useActionState(action, { ok: false } as SaveResult);
  return (
    <form action={a} className="space-y-4">
      {s.message && <p role={s.ok ? 'status' : 'alert'} className={`rounded-md px-3 py-2 text-[14px] font-medium ${s.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-dark'}`}>{s.message}</p>}
      <TextInput name="current" label="รหัสผ่านปัจจุบัน" type="password" required error={s.errors?.current} />
      <TextInput name="password" label="รหัสผ่านใหม่" type="password" required error={s.errors?.password} help="อย่างน้อย 10 ตัว มีตัวอักษรอังกฤษและตัวเลข" />
      <TextInput name="confirm" label="พิมพ์รหัสผ่านใหม่อีกครั้ง" type="password" required error={s.errors?.confirm} />
      <SubmitButton className="btn btn-primary min-h-[42px] px-5">เปลี่ยนรหัสผ่าน</SubmitButton>
    </form>
  );
}
