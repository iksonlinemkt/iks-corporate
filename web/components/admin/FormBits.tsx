'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ImagePlus, Plus, Trash2, X } from 'lucide-react';

export const inputCls = 'field !py-2.5 aria-[invalid=true]:border-red aria-[invalid=true]:bg-red-50/40';

export function FieldWrap({
  id, label, help, error, children, wide, count,
}: {
  id: string; label: string; help?: string; error?: string; children: React.ReactNode; wide?: boolean; count?: { now: number; max: number };
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14px] font-semibold text-navy">{label}</label>
        {count && <span className={`text-[12px] tabular-nums ${count.now > count.max ? 'font-semibold text-red' : 'text-steel'}`}>{count.now}/{count.max}</span>}
      </div>
      {children}
      {help && !error && <p className="mt-1 text-[12.5px] text-steel">{help}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-[13px] font-semibold text-red">{error}</p>}
    </div>
  );
}

/** ช่องข้อความพร้อมตัวนับตัวอักษร */
export function TextInput({
  name, label, defaultValue, max, error, help, wide, multiline, type = 'text', required, placeholder,
}: {
  name: string; label: string; defaultValue?: string | null; max?: number; error?: string; help?: string; wide?: boolean;
  multiline?: boolean; type?: string; required?: boolean; placeholder?: string;
}) {
  const [len, setLen] = useState((defaultValue ?? '').length);
  const id = `f-${name}`;
  const common = {
    id, name, defaultValue: defaultValue ?? '', 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setLen(e.target.value.length),
    className: inputCls, required, placeholder,
  };
  return (
    <FieldWrap id={id} label={label + (required ? ' *' : '')} help={help} error={error} wide={wide || multiline} count={max ? { now: len, max } : undefined}>
      {multiline ? <textarea {...common} rows={max && max > 600 ? 8 : 4} className={`${inputCls} resize-y`} /> : <input {...common} type={type} />}
    </FieldWrap>
  );
}

/** อัปโหลดรูปเดี่ยว: แสดงรูปปัจจุบัน + พรีวิวรูปใหม่ก่อนบันทึก */
export function ImageInput({
  name, label, value, mediaBase, hint, error,
}: { name: string; label: string; value: string | null; mediaBase: string; hint?: string; error?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const current = value ? `${mediaBase}/${value}` : null;
  const shown = preview ?? (remove ? null : current);
  const id = `f-${name}`;
  return (
    <FieldWrap id={id} label={label} help={hint} error={error} wide>
      <input type="hidden" name={name} value={value ?? ''} />
      <div className="flex flex-wrap items-center gap-4 rounded-md border border-dashed border-line bg-mist/60 p-3">
        <div className="relative h-28 w-44 shrink-0 overflow-hidden rounded border border-line bg-white">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="ph flex h-full w-full items-center justify-center text-[12px] text-steel">ยังไม่มีรูป</span>
          )}
          {preview && <span className="absolute left-1 top-1 rounded bg-copper px-1.5 py-0.5 text-[11px] font-semibold text-navy-950">รูปใหม่</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 self-start rounded-md bg-navy px-4 text-[14px] font-semibold text-white hover:bg-navy-2">
            <ImagePlus size={17} aria-hidden />{shown ? 'เปลี่ยนรูป' : 'เลือกรูป'}
            <input
              ref={fileRef} id={id} type="file" name={`file__${name}`} accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setPreview(f ? URL.createObjectURL(f) : null);
                if (f) setRemove(false);
              }}
            />
          </label>
          {preview && (
            <button type="button" className="text-left text-[13px] font-semibold text-steel underline" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}>
              ยกเลิกรูปใหม่
            </button>
          )}
          {current && !preview && (
            <label className="inline-flex items-center gap-2 text-[13px] text-steel">
              <input type="checkbox" name={`remove__${name}`} checked={remove} onChange={(e) => setRemove(e.target.checked)} className="h-4 w-4 accent-[var(--color-red)]" />
              ลบรูปนี้
            </label>
          )}
          <span className="text-[12px] text-steel">JPG / PNG / WebP ไม่เกิน 10 MB · ระบบย่อและแปลงเป็น WebP ให้</span>
        </div>
      </div>
    </FieldWrap>
  );
}

/** แกลเลอรีหลายรูป */
export function ImagesInput({
  name, label, value, mediaBase, hint, error,
}: { name: string; label: string; value: string[]; mediaBase: string; hint?: string; error?: string }) {
  const [kept, setKept] = useState<string[]>(value);
  const [previews, setPreviews] = useState<string[]>([]);
  const id = `f-${name}`;
  return (
    <FieldWrap id={id} label={label} help={hint} error={error} wide>
      <input type="hidden" name={name} value={JSON.stringify(kept)} />
      <div className="rounded-md border border-dashed border-line bg-mist/60 p-3">
        <ul className="flex flex-wrap gap-3">
          {kept.map((p, i) => (
            <li key={p} className="relative h-24 w-32 overflow-hidden rounded border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${mediaBase}/${p}`} alt={`รูปที่ ${i + 1}`} className="h-full w-full object-cover" />
              <button type="button" aria-label={`ลบรูปที่ ${i + 1}`} onClick={() => setKept(kept.filter((x) => x !== p))}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-navy-950/80 text-white hover:bg-red">
                <X size={15} />
              </button>
            </li>
          ))}
          {previews.map((u) => (
            <li key={u} className="relative h-24 w-32 overflow-hidden rounded border border-copper bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-copper px-1.5 py-0.5 text-[11px] font-semibold text-navy-950">ใหม่</span>
            </li>
          ))}
        </ul>
        <label className="mt-3 inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-navy px-4 text-[14px] font-semibold text-white hover:bg-navy-2">
          <ImagePlus size={17} aria-hidden />เพิ่มรูป (เลือกหลายรูปได้)
          <input id={id} type="file" multiple name={`file__${name}`} accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only"
            onChange={(e) => setPreviews(Array.from(e.target.files ?? []).map((f) => URL.createObjectURL(f)))} />
        </label>
      </div>
    </FieldWrap>
  );
}

/** รายการข้อความ (เช่น สิทธิประโยชน์) */
export function StringsEditor({ name, label, value, error }: { name: string; label: string; value: string[]; error?: string }) {
  const [items, setItems] = useState<string[]>(value.length ? value : ['']);
  return (
    <FieldWrap id={`f-${name}`} label={label} error={error} wide help="หนึ่งบรรทัดต่อหนึ่งข้อ">
      <input type="hidden" name={name} value={JSON.stringify(items.filter((x) => x.trim()))} />
      <ul className="space-y-2">
        {items.map((v, i) => (
          <li key={i} className="flex gap-2">
            <input id={i === 0 ? `f-${name}` : undefined} className={inputCls} value={v} maxLength={120} aria-label={`${label} ข้อที่ ${i + 1}`}
              onChange={(e) => setItems(items.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" aria-label={`ลบข้อที่ ${i + 1}`} onClick={() => setItems(items.filter((_, j) => j !== i))}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-steel hover:border-red hover:text-red"><Trash2 size={17} /></button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setItems([...items, ''])} className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-copper-dark hover:underline">
        <Plus size={16} />เพิ่มข้อ
      </button>
    </FieldWrap>
  );
}

/** สีรถ: ชื่อสี + ตัวเลือกสี */
export function ColorsEditor({ name, label, value, error }: { name: string; label: string; value: { name: string; hex: string }[]; error?: string }) {
  const [items, setItems] = useState(value);
  const set = (i: number, k: 'name' | 'hex', v: string) => setItems(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <FieldWrap id={`f-${name}`} label={label} error={error} wide>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      <ul className="flex flex-wrap gap-2">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2 rounded-md border border-line bg-white p-1.5 pr-2">
            <input type="color" value={c.hex} onChange={(e) => set(i, 'hex', e.target.value)} aria-label={`สีที่ ${i + 1}`} className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            <input value={c.name} onChange={(e) => set(i, 'name', e.target.value)} placeholder="ชื่อสี" maxLength={30} aria-label={`ชื่อสีที่ ${i + 1}`}
              className="w-28 rounded border border-line px-2 py-1 text-[14px]" />
            <button type="button" aria-label={`ลบสีที่ ${i + 1}`} onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-steel hover:text-red"><X size={16} /></button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setItems([...items, { name: '', hex: '#FFFFFF' }])}
            className="flex h-[46px] items-center gap-1 rounded-md border border-dashed border-line px-3 text-[14px] font-semibold text-copper-dark hover:border-copper">
            <Plus size={16} />เพิ่มสี
          </button>
        </li>
      </ul>
    </FieldWrap>
  );
}

/** ข้อมูลจำเพาะ: หัวข้อ + ค่า */
export function SpecsEditor({ name, label, value, error }: { name: string; label: string; value: Record<string, string>; error?: string }) {
  const [rows, setRows] = useState<[string, string][]>(Object.entries(value).length ? Object.entries(value) : [['', '']]);
  const set = (i: number, k: 0 | 1, v: string) => setRows(rows.map((r, j) => (j === i ? (k === 0 ? [v, r[1]] : [r[0], v]) : r)));
  return (
    <FieldWrap id={`f-${name}`} label={label} error={error} wide help="เช่น เครื่องยนต์ | 1.9 Ddi Blue Power">
      <input type="hidden" name={name} value={JSON.stringify(rows.filter((r) => r[0].trim()))} />
      <ul className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
            <input className={inputCls} value={r[0]} placeholder="หัวข้อ" maxLength={60} aria-label={`หัวข้อแถวที่ ${i + 1}`} onChange={(e) => set(i, 0, e.target.value)} />
            <input className={inputCls} value={r[1]} placeholder="ค่า" maxLength={200} aria-label={`ค่าแถวที่ ${i + 1}`} onChange={(e) => set(i, 1, e.target.value)} />
            <button type="button" aria-label={`ลบแถวที่ ${i + 1}`} onClick={() => setRows(rows.filter((_, j) => j !== i))}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-steel hover:border-red hover:text-red"><Trash2 size={17} /></button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setRows([...rows, ['', '']])} className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-copper-dark hover:underline">
        <Plus size={16} />เพิ่มแถว
      </button>
    </FieldWrap>
  );
}

export function SubmitButton({ children, intent, className, pendingText = 'กำลังบันทึก…' }: { children: React.ReactNode; intent?: string; className: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={intent ? 'intent' : undefined} value={intent} disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? pendingText : children}
    </button>
  );
}

/** ปุ่มที่ต้องยืนยันก่อนส่ง (เช่น ลบ) */
export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
