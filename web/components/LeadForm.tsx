'use client';

import { useActionState, useEffect, useRef } from 'react';
import { trackEvent } from './Analytics';
import { CircleCheck, Send } from 'lucide-react';
import { submitLead, type LeadState } from '@/app/actions';

type Opt = { id: string; name: string };

const TYPE_OPTIONS = [
  { value: 'quote', label: 'ขอใบเสนอราคา' },
  { value: 'test_drive', label: 'นัดทดลองขับ' },
  { value: 'commercial', label: 'รถเพื่อการพาณิชย์ / ตัวถัง' },
  { value: 'service_booking', label: 'นัดเข้าศูนย์บริการ' },
  { value: 'contact', label: 'สอบถามทั่วไป' },
];

const TIMES = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

export function LeadForm({
  defaultType = 'contact', fixedType = false, branches = [], vehicles = [], serviceTypes = [],
  pdpaText, pdpaVersion, sourcePage, defaultVehicleId, promo, submitLabel = 'ส่งข้อมูล', dark = false, utm = {}, interests = [],
}: {
  defaultType?: string;
  fixedType?: boolean;
  branches?: Opt[];
  vehicles?: Opt[];
  serviceTypes?: string[];
  pdpaText?: string;
  pdpaVersion?: string;
  sourcePage: string;
  defaultVehicleId?: string;
  promo?: string;
  submitLabel?: string;
  dark?: boolean;
  /** แหล่งที่มา เช่น utm_source=facebook_live */
  utm?: Record<string, string>;
  /** ตัวเลือก "สนใจเรื่อง" (บันทึกในช่อง service_type) */
  interests?: string[];
}) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { ok: false });
  const formRef = useRef<HTMLFormElement>(null);
  const booking = defaultType === 'service_booking';
  const scheduled = booking || defaultType === 'test_drive';
  const val = (k: string, fallback = '') => state.values?.[k] ?? fallback;

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      // วัดผลใน Google Analytics: ลูกค้าส่งฟอร์มสำเร็จ
      trackEvent('generate_lead', { lead_type: defaultType ?? 'contact', page: sourcePage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  if (state.ok && state.message) {
    return (
      <div role="status" className={`flex flex-col items-start gap-3 rounded-[var(--radius-card)] p-6 ${dark ? 'bg-white/8 text-copper-light' : 'bg-blue-soft text-navy'}`}>
        <CircleCheck size={32} className={dark ? 'text-white' : 'text-copper-dark'} aria-hidden />
        <p className="font-display text-lg font-bold">{state.message}</p>
        <a href={sourcePage} className={`text-[15px] font-semibold underline ${dark ? 'text-white' : 'text-copper-dark'}`}>ส่งข้อมูลอีกครั้ง</a>
      </div>
    );
  }

  const err = (k: keyof NonNullable<LeadState['errors']>) => state.errors?.[k];
  const label = `mb-1.5 block text-[14px] font-medium ${dark ? 'text-white/85' : 'text-navy'}`;
  const errCls = 'mt-1 text-[13px] font-medium text-red';

  return (
    <form ref={formRef} action={action} noValidate className="relative grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="source_page" value={sourcePage} />
      {pdpaVersion && <input type="hidden" name="consent_version" value={pdpaVersion} />}
      {promo && <input type="hidden" name="promo" value={promo} />}
      {Object.entries(utm).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label>เว็บไซต์ <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {fixedType ? (
        <input type="hidden" name="lead_type" value={defaultType} />
      ) : (
        <div className="sm:col-span-2">
          <label htmlFor="lead_type" className={label}>เรื่องที่ติดต่อ</label>
          <select id="lead_type" name="lead_type" defaultValue={val('lead_type', defaultType)} className="field">
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="full_name" className={label}>ชื่อ-นามสกุล <span className="text-red">*</span></label>
        <input id="full_name" name="full_name" autoComplete="name" required className="field" defaultValue={val('full_name')}
          aria-invalid={!!err('full_name')} aria-describedby={err('full_name') ? 'e-name' : undefined} />
        {err('full_name') && <p id="e-name" className={errCls}>{err('full_name')}</p>}
      </div>
      <div>
        <label htmlFor="phone" className={label}>เบอร์โทรศัพท์ <span className="text-red">*</span></label>
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required className="field" defaultValue={val('phone')}
          maxLength={10} pattern="0[0-9]{9}" placeholder="0812345678"
          onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, '').slice(0, 10); }}
          aria-invalid={!!err('phone')} aria-describedby={err('phone') ? 'e-phone' : 'h-phone'} />
        {err('phone')
          ? <p id="e-phone" className={errCls}>{err('phone')}</p>
          : <p id="h-phone" className={`mt-1 text-[13px] ${dark ? 'text-white/60' : 'text-steel'}`}>ขึ้นต้นด้วย 0 ครบ 10 หลัก</p>}
      </div>
      <div className="sm:col-span-2">
        <div className="sm:w-[calc(50%-0.5rem)]">
          <label htmlFor="line_id" className={label}>LINE ID <span className={`font-normal ${dark ? 'text-white/60' : 'text-steel'}`}>(ไม่บังคับ · ใช้ติดต่อกลับเมื่อโทรไม่สะดวก)</span></label>
          <input id="line_id" name="line_id" autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={50} className="field" defaultValue={val('line_id')}
            placeholder="เช่น somchai123" aria-invalid={!!err('line_id')} aria-describedby={err('line_id') ? 'e-line' : undefined} />
          {err('line_id') && <p id="e-line" className={errCls}>{err('line_id')}</p>}
        </div>
      </div>

      {interests.length > 0 && (
        <div className="sm:col-span-2">
          <label htmlFor="interest" className={label}>สนใจเรื่อง</label>
          <select id="interest" name="service_type" defaultValue={val('service_type', interests[0])} className="field">
            {interests.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </div>
      )}

      {vehicles.length > 0 && (
        <div>
          <label htmlFor="vehicle_id" className={label}>รุ่นรถที่สนใจ</label>
          <select id="vehicle_id" name="vehicle_id" defaultValue={val('vehicle_id', defaultVehicleId ?? '')} className="field">
            <option value="">ยังไม่แน่ใจ</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      )}
      {branches.length > 0 && (
        <div>
          <label htmlFor="branch_id" className={label}>{booking ? 'ศูนย์บริการ' : 'สาขาที่สะดวก'}</label>
          <select id="branch_id" name="branch_id" defaultValue={val('branch_id')} className="field">
            <option value="">{booking ? 'เลือกศูนย์บริการ' : 'สาขาไหนก็ได้'}</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      {scheduled && (
        <>
          {booking && serviceTypes.length > 0 && (
            <div className="sm:col-span-2">
              <label htmlFor="service_type" className={label}>ประเภทบริการ</label>
              <select id="service_type" name="service_type" defaultValue={val('service_type')} className="field">
                <option value="">เลือกประเภทบริการ</option>
                {serviceTypes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="preferred_date" className={label}>วันที่สะดวก</label>
            <input id="preferred_date" name="preferred_date" type="date" className="field" defaultValue={val('preferred_date')}
              min={new Date().toISOString().slice(0, 10)} aria-invalid={!!err('preferred_date')} />
            {err('preferred_date') && <p className={errCls}>{err('preferred_date')}</p>}
          </div>
          <div>
            <label htmlFor="preferred_time" className={label}>เวลาที่สะดวก</label>
            <select id="preferred_time" name="preferred_time" defaultValue={val('preferred_time')} className="field">
              <option value="">เลือกเวลา</option>
              {TIMES.map((t) => <option key={t} value={t}>{t} น.</option>)}
            </select>
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label htmlFor="message" className={label}>รายละเอียดเพิ่มเติม</label>
        <textarea id="message" name="message" rows={3} maxLength={1000} className="field resize-y" defaultValue={val('message')}
          placeholder={booking ? 'เช่น ทะเบียนรถ อาการที่พบ' : 'เช่น รุ่นที่สนใจ งบประมาณ การใช้งาน'} />
      </div>

      <div className="sm:col-span-2">
        <label className={`flex items-start gap-3 text-[14px] leading-relaxed ${dark ? 'text-white/85' : 'text-steel'}`}>
          <input type="checkbox" name="consent" defaultChecked={val('consent') === 'on'} className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-copper)]"
            aria-invalid={!!err('consent')} aria-describedby={err('consent') ? 'e-consent' : undefined} />
          <span>{pdpaText ?? 'ข้าพเจ้ายินยอมให้บริษัทเก็บและใช้ข้อมูลเพื่อติดต่อกลับเกี่ยวกับสินค้าและบริการ'}</span>
        </label>
        {err('consent') && <p id="e-consent" className={errCls}>{err('consent')}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60 sm:w-auto">
          <Send size={18} aria-hidden />{pending ? 'กำลังส่ง…' : submitLabel}
        </button>
        {state.message && !state.ok && <p role="alert" className="text-[14px] font-medium text-red">{state.message}</p>}
      </div>
    </form>
  );
}
