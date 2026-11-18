'use client';

import { useActionState } from 'react';
import { CircleCheck, Save, Send, TriangleAlert } from 'lucide-react';
import type { Field } from '@/lib/admin/entities';
import { IMAGE_SLOTS, ICONS } from '@/lib/admin/entities';
import type { SaveResult } from '@/lib/admin/crud';
import {
  ColorsEditor, FieldWrap, ImageInput, ImagesInput, SpecsEditor, StringsEditor, SubmitButton, TextInput, inputCls,
} from './FormBits';
import { PlaceFinder } from './PlaceFinder';

type Values = Record<string, unknown>;

export function EntityForm({
  fields, values, refs, mediaBase, action, isNew, status, scopeField, scopeValue,
}: {
  fields: Field[];
  values: Values;
  refs: Record<string, { value: string; label: string }[]>;
  mediaBase: string;
  action: (prev: SaveResult, fd: FormData) => Promise<SaveResult>;
  isNew: boolean;
  status?: string;
  scopeField?: string;
  scopeValue?: string;
}) {
  const [state, formAction] = useActionState(action, { ok: false } as SaveResult);
  const err = (n: string) => state.errors?.[n];
  // ถ้าบันทึกไม่ผ่าน ใช้ค่าที่ผู้ใช้เพิ่งกรอก (React ล้างฟอร์มหลังส่งทุกครั้ง)
  const v = (n: string) => (state.values && n in state.values ? state.values[n] : values[n]);
  const checked = (n: string) => (state.values && n in state.values ? state.values[n] === 'on' : !!values[n]);

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.message && (
        <div role={state.ok ? 'status' : 'alert'}
          className={`flex items-start gap-2 rounded-md border px-4 py-3 text-[14px] font-medium ${state.ok ? 'border-emerald-600/25 bg-emerald-50 text-emerald-800' : 'border-red/30 bg-red-50 text-red-dark'}`}>
          {state.ok ? <CircleCheck size={18} className="mt-0.5 shrink-0" /> : <TriangleAlert size={18} className="mt-0.5 shrink-0" />}
          {state.message}
        </div>
      )}
      {state.warnings?.map((w) => (
        <div key={w} className="rounded-md border border-amber-500/30 bg-amber-50 px-4 py-2.5 text-[14px] text-amber-900">{w}</div>
      ))}
      {isNew && scopeField && scopeValue && !fields.some((f) => f.name === scopeField) && <input type="hidden" name={scopeField} value={scopeValue} />}

      <div className="grid gap-x-5 gap-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:grid-cols-2 sm:p-6">
        {fields.map((f) => {
          if (f.createOnly && !isNew) return null;
          const id = `f-${f.name}`;
          const slot = f.slot ? IMAGE_SLOTS[f.slot] : undefined;
          switch (f.type) {
            case 'text': case 'url': case 'slug':
              return (
                <TextInput key={f.name} name={f.name} label={f.label} defaultValue={(v(f.name) as string) ?? ''} max={f.max} error={err(f.name)}
                  help={f.help ?? (f.type === 'url' ? 'ลิงก์ในเว็บใส่แบบ /contact หรือลิงก์นอกแบบ https://...' : undefined)}
                  wide={f.wide} required={f.required} type={f.type === 'url' ? 'text' : 'text'} />
              );
            case 'textarea':
              return <TextInput key={f.name} name={f.name} label={f.label} defaultValue={(v(f.name) as string) ?? ''} max={f.max} error={err(f.name)} help={f.help} multiline required={f.required} />;
            case 'number':
              return <TextInput key={f.name} name={f.name} label={f.label} defaultValue={v(f.name) == null ? '' : String(v(f.name))} error={err(f.name)} help={f.help} required={f.required} type="text" />;
            case 'select': case 'icon': case 'ref': {
              const opts = f.type === 'icon' ? ICONS : f.type === 'ref' ? refs[f.name] ?? [] : f.options ?? [];
              return (
                <FieldWrap key={f.name} id={id} label={f.label + (f.required ? ' *' : '')} help={f.help} error={err(f.name)} wide={f.wide}>
                  <select id={id} name={f.name} defaultValue={(v(f.name) as string) ?? (isNew && f.name === scopeField ? scopeValue : '') ?? ''} className={inputCls} aria-invalid={!!err(f.name)}>
                    {!f.required && <option value="">— ไม่ระบุ —</option>}
                    {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </FieldWrap>
              );
            }
            case 'bool':
              return (
                <label key={f.name} className="flex items-center gap-3 self-end rounded-md border border-line px-3.5 py-3 text-[14px] font-semibold text-navy">
                  <input type="checkbox" name={f.name} defaultChecked={checked(f.name)} className="h-5 w-5 accent-[var(--color-copper)]" />
                  {f.label}
                </label>
              );
            case 'datetime': case 'date':
              return (
                <FieldWrap key={f.name} id={id} label={f.label} help={f.help} error={err(f.name)}>
                  <input id={id} type={f.type === 'date' ? 'date' : 'datetime-local'} name={f.name} defaultValue={(v(f.name) as string) ?? ''} className={inputCls} />
                </FieldWrap>
              );
            case 'image':
              return <ImageInput key={`${f.name}:${String(v(f.name) ?? '')}`} name={f.name} label={f.label} value={(v(f.name) as string) ?? null} mediaBase={mediaBase} hint={slot?.label} error={err(f.name)} />;
            case 'images':
              return <ImagesInput key={`${f.name}:${JSON.stringify(v(f.name) ?? [])}`} name={f.name} label={f.label} value={(v(f.name) as string[]) ?? []} mediaBase={mediaBase} hint={slot?.label} error={err(f.name)} />;
            case 'strings':
              return <StringsEditor key={f.name} name={f.name} label={f.label} value={(v(f.name) as string[]) ?? []} error={err(f.name)} />;
            case 'colors':
              return <ColorsEditor key={f.name} name={f.name} label={f.label} value={(v(f.name) as { name: string; hex: string }[]) ?? []} error={err(f.name)} />;
            case 'placefinder':
              return <PlaceFinder key={f.name} label={f.label} />;
            case 'specs':
              return <SpecsEditor key={f.name} name={f.name} label={f.label} value={(v(f.name) as Record<string, string>) ?? {}} error={err(f.name)} />;
          }
        })}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-[var(--radius-card)] sm:border">
        <SubmitButton intent="publish" className="btn btn-primary min-h-[42px] px-5 text-[15px]"><Send size={17} />บันทึกและเผยแพร่</SubmitButton>
        <SubmitButton intent="draft" className="btn btn-ghost min-h-[42px] bg-white px-5 text-[15px]"><Save size={17} />บันทึกเป็นร่าง</SubmitButton>
        {!isNew && status === 'published' && (
          <SubmitButton className="btn btn-ghost min-h-[42px] bg-white px-5 text-[15px]">บันทึก (คงสถานะเผยแพร่)</SubmitButton>
        )}
        <span className="text-[13px] text-steel">
          {status === 'sample' ? 'ตอนนี้เป็นข้อมูลตัวอย่าง: กด "บันทึกและเผยแพร่" เมื่อแก้เป็นข้อมูลจริงแล้ว' : 'ร่าง = ยังไม่แสดงบนเว็บ'}
        </span>
      </div>
    </form>
  );
}
