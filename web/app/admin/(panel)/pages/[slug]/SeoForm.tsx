'use client';

import { useActionState } from 'react';
import type { SaveResult } from '@/lib/admin/crud';
import { IMAGE_SLOTS } from '@/lib/admin/entities';
import { ImageInput, SubmitButton, TextInput } from '@/components/admin/FormBits';

export function SeoForm({
  action, values, mediaBase,
}: {
  action: (p: SaveResult, fd: FormData) => Promise<SaveResult>;
  values: { seo_title: string; seo_description: string; og_image: string | null };
  mediaBase: string;
}) {
  const [state, formAction] = useActionState(action, { ok: false } as SaveResult);
  const cur = (k: 'seo_title' | 'seo_description') => state.values?.[k] ?? values[k];
  return (
    <form action={formAction} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
      {state.message && (
        <p role={state.ok ? 'status' : 'alert'} className={`rounded-md px-4 py-2.5 text-[14px] font-medium ${state.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-dark'}`}>{state.message}</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextInput name="seo_title" label="ชื่อหน้าบน Google" defaultValue={cur('seo_title')} max={70} error={state.errors?.seo_title} help="ขึ้นเป็นหัวข้อสีน้ำเงินในผลค้นหา" wide />
        <TextInput name="seo_description" label="คำอธิบายบน Google" defaultValue={cur('seo_description')} max={170} error={state.errors?.seo_description} multiline />
        <ImageInput key={values.og_image ?? 'none'} name="og_image" label="รูปตอนแชร์ลิงก์ (Facebook / LINE)" value={values.og_image} mediaBase={mediaBase} hint={IMAGE_SLOTS.og_image.label} />
      </div>
      <SubmitButton className="btn btn-primary min-h-[42px] px-5 text-[15px]">บันทึก SEO</SubmitButton>
    </form>
  );
}
