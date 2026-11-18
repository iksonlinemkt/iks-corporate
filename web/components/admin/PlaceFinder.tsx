'use client';

import { useState, useTransition, useRef } from 'react';
import { Check, MapPin, Search, Star } from 'lucide-react';
import { searchPlacesAction } from '@/app/admin/actions';
import type { PlaceCandidate } from '@/lib/google';
import { inputCls } from './FormBits';

/** ใส่ค่าให้ช่องในฟอร์มเดียวกัน (ช่องเป็น uncontrolled → ตั้งค่าแล้วแจ้ง React ด้วย input event) */
function setField(form: HTMLFormElement, name: string, value: string, onlyIfEmpty = false) {
  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  if (!el || (onlyIfEmpty && el.value.trim())) return false;
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

export function PlaceFinder({ label }: { label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const form = () => box.current?.closest('form') ?? null;

  const run = () => {
    const f = form();
    // ยังไม่พิมพ์อะไร → ใช้ชื่อสาขาในฟอร์ม
    const q = query.trim() || `อีซูซุกรุงเทพเซลส์ ${(f?.elements.namedItem('name') as HTMLInputElement | null)?.value ?? ''}`.trim();
    if (!query.trim()) setQuery(q);
    setError(null);
    start(async () => {
      const r = await searchPlacesAction(q);
      if (r.error) { setError(r.error); setResults(null); return; }
      setResults(r.places ?? []);
    });
  };

  const pick = (p: PlaceCandidate) => {
    const f = form();
    if (!f) return;
    setField(f, 'google_place_id', p.id);
    if (p.lat !== null) setField(f, 'latitude', p.lat.toFixed(6));
    if (p.lng !== null) setField(f, 'longitude', p.lng.toFixed(6));
    if (p.uri) setField(f, 'map_url', p.uri);
    if (p.address) setField(f, 'address', p.address, true);
    setPicked(p.id);
  };

  return (
    <div ref={box} className="rounded-md border border-copper/40 bg-copper/5 p-4 sm:col-span-2">
      <p className="flex items-center gap-2 font-display text-[15px] font-bold text-navy"><MapPin size={18} className="text-copper-dark" />{label}</p>
      <p className="mt-1 text-[13px] text-steel">
        ค้นหาสาขาบน Google Maps แล้วกด &quot;ใช้ที่นี่&quot; ระบบจะเติม Place ID พิกัด และลิงก์ Google Maps ให้
        (ใช้ดึงคะแนนรีวิวและปุ่มนำทาง) จากนั้นกดบันทึกด้านล่าง
      </p>
      <div className="mt-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } }}
          placeholder="เช่น อีซูซุกรุงเทพเซลส์ บางนา"
          className={`${inputCls} flex-1`}
          aria-label="คำค้นหาสถานที่"
        />
        <button type="button" onClick={run} disabled={pending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-navy px-4 text-[14px] font-semibold text-white hover:bg-navy-2 disabled:opacity-60">
          <Search size={16} />{pending ? 'กำลังค้นหา…' : 'ค้นหา'}
        </button>
      </div>
      {error && <p role="alert" className="mt-3 rounded-md border border-red/30 bg-red-50 px-3 py-2 text-[13px] text-red-dark">{error}</p>}
      {results && results.length === 0 && <p className="mt-3 text-[13px] text-steel">ไม่พบสถานที่ ลองเปลี่ยนคำค้น เช่น ใส่ชื่อถนนหรือเขต</p>}
      {results && results.length > 0 && (
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
          {results.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold text-navy">{p.name}</p>
                {p.address && <p className="text-[13px] text-steel">{p.address}</p>}
                {p.rating !== null && (
                  <p className="mt-0.5 flex items-center gap-1 text-[13px] text-navy">
                    <Star size={13} className="fill-amber text-amber" />{p.rating.toFixed(1)} · {p.count.toLocaleString('th-TH')} รีวิว
                  </p>
                )}
              </div>
              {p.uri && <a href={p.uri} target="_blank" rel="noopener" className="text-[13px] font-semibold text-copper-dark hover:underline">ดูใน Maps</a>}
              <button type="button" onClick={() => pick(p)}
                className={`inline-flex h-8 items-center gap-1 rounded-md px-3 text-[13px] font-semibold ${picked === p.id ? 'bg-emerald-600 text-white' : 'bg-copper text-white hover:bg-copper-dark'}`}>
                {picked === p.id ? <><Check size={14} />เติมแล้ว</> : 'ใช้ที่นี่'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
