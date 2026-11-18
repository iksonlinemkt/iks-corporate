'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

/**
 * Google Analytics 4 + แบนเนอร์ขอความยินยอมคุกกี้ (PDPA)
 * - ก่อนกดยอมรับ: consent = denied (GA ไม่เก็บคุกกี้ ส่งได้แค่สัญญาณนับแบบไม่ระบุตัวตน)
 * - กดยอมรับ: เก็บสถิติเต็มรูปแบบ · ตัวเลือกจำไว้ในเบราว์เซอร์
 */
const KEY = 'iks_cookie_consent';
type Gtag = (...args: unknown[]) => void;

function readChoice(): 'yes' | 'no' | null {
  try { const v = localStorage.getItem(KEY); return v === 'yes' || v === 'no' ? v : null; } catch { return null; }
}

export function Analytics({ id }: { id: string }) {
  const [choice, setChoice] = useState<'yes' | 'no' | null | 'unknown'>('unknown');
  useEffect(() => { setChoice(readChoice()); }, []);

  const decide = (v: 'yes' | 'no') => {
    try { localStorage.setItem(KEY, v); } catch { /* โหมดส่วนตัว: ไม่จำ */ }
    const g = (window as unknown as { gtag?: Gtag }).gtag;
    g?.('consent', 'update', { analytics_storage: v === 'yes' ? 'granted' : 'denied' });
    setChoice(v);
  };

  return (
    <>
      <Script id="ga-consent" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        var c = null; try { c = localStorage.getItem('${KEY}'); } catch (e) {}
        gtag('consent', 'default', { analytics_storage: c === 'yes' ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
        gtag('js', new Date());
        gtag('config', '${id}');
      `}</Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive" />
      {choice === null && (
        <div role="dialog" aria-label="การใช้คุกกี้" className="fixed inset-x-3 bottom-[76px] z-50 mx-auto max-w-[640px] rounded-[var(--radius-card)] border border-line bg-white p-4 text-navy shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)] sm:bottom-5 lg:bottom-5">
          <p className="text-[14px] leading-relaxed">
            เว็บไซต์นี้ใช้คุกกี้เพื่อวิเคราะห์การใช้งานและปรับปรุงบริการ ตามนโยบายความเป็นส่วนตัว (PDPA)
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => decide('no')} className="btn btn-ghost min-h-[38px] px-4 text-[14px]">ปฏิเสธ</button>
            <button type="button" onClick={() => decide('yes')} className="btn btn-primary min-h-[38px] px-4 text-[14px]">ยอมรับ</button>
          </div>
        </div>
      )}
    </>
  );
}

/** ส่งเหตุการณ์ไป GA4 (ไม่มี GA = ไม่ทำอะไร) */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try { (window as unknown as { gtag?: Gtag }).gtag?.('event', name, params); } catch { /* ignore */ }
}
