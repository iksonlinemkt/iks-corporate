import Link from 'next/link';
import { CalendarCheck, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import { lineHref, telHref } from '@/lib/format';
import { Media } from './Media';
import { LeadForm } from './LeadForm';
import { SectionHeading, SectionShell } from './SectionHeading';
import { Rail } from './Rail';
import type { Branch, Section, Service, Settings } from '@/lib/types';

/** ส่วนงานบริการหลังการขาย (ย้ายจากหน้า "บริการ" มาอยู่หน้า "ติดต่อเรา") */

const STEPS = ['เลือกศูนย์บริการ วัน และเวลาที่สะดวก', 'เจ้าหน้าที่โทรยืนยันนัดหมายกับคุณ', 'นำรถเข้าศูนย์ตามเวลานัด ไม่ต้องรอคิวนาน'];
const isBookingItem = (s: Service) => /จอง/.test(s.title);

export function ServiceBooking({ s, settings, services, centers, sourcePage }: {
  s: Section; settings: Settings; services: Service[]; centers: Branch[]; sourcePage: string;
}) {
  return (
    <SectionShell tone="mist" id="booking">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <SectionHeading title={s.title ?? 'จองนัดหมายบริการออนไลน์'} subtitle={s.subtitle ?? 'เลือกวัน เวลา และศูนย์บริการได้สะดวก'} />
          <ul className="space-y-3 text-[15px]">
            {STEPS.map((t, i) => (
              <li key={t} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy font-display text-[13px] font-bold text-white">{i + 1}</span>
                <span className="pt-0.5">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        {settings.booking_url ? (
          <ExternalBooking url={settings.booking_url} embed={settings.booking_embed === 'on'} settings={settings} />
        ) : (
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-8">
            <LeadForm
              fixedType
              defaultType="service_booking"
              sourcePage={sourcePage}
              branches={centers.map((b) => ({ id: b.id, name: b.name }))}
              serviceTypes={services.filter((g) => !isBookingItem(g)).map((g) => g.title)}
              pdpaText={settings.pdpa_text}
              pdpaVersion={settings.pdpa_version}
              submitLabel="จองนัดหมาย"
            />
          </div>
        )}
      </div>
    </SectionShell>
  );
}

/** ระบบนัดหมายของบริษัท (Google Apps Script เชื่อม LINE) — ให้ทุกช่องทางใช้ระบบเดียวกัน */
function ExternalBooking({ url, embed, settings }: { url: string; embed: boolean; settings: Settings }) {
  const tel = telHref(settings.phone_service ?? settings.phone_main);
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);
  if (embed) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
        <iframe src={url} title="นัดหมายเข้ารับบริการ - IKS" loading="lazy" className="h-[860px] w-full border-0" allow="geolocation" />
        <p className="border-t border-line px-5 py-3 text-center text-[14px] text-steel">
          ฟอร์มไม่ขึ้น? <a href={url} target="_blank" rel="noopener" className="font-semibold text-copper-dark underline">เปิดหน้าจองนัดหมาย</a>
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center rounded-[var(--radius-card)] border border-line bg-white p-6 text-center sm:p-10">
      <span className="copper-metal mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"><CalendarCheck size={30} aria-hidden /></span>
      <p className="mt-5 text-[22px] font-bold leading-snug sm:text-[26px]">จองนัดหมายเข้ารับบริการออนไลน์</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-steel">เลือกศูนย์บริการ วัน และเวลาที่สะดวกได้ในไม่กี่ขั้นตอน ระบบเดียวกับการจองผ่าน LINE ของเรา</p>
      <a href={url} target="_blank" rel="noopener" className="btn btn-primary mx-auto mt-7 min-h-[52px] px-8 text-[17px] shadow-[0_10px_30px_-12px_rgb(194_124_69/0.9)]">
        <CalendarCheck size={20} aria-hidden />จองนัดหมายเลย<ExternalLink size={16} className="opacity-70" aria-hidden />
      </a>
      {(tel || line) && (
        <div className="mt-6 flex flex-wrap justify-center gap-2 border-t border-line pt-5 text-[14px]">
          <span className="w-full text-steel">หรือติดต่อศูนย์บริการ</span>
          {tel && <a href={tel} className="btn btn-ghost min-h-[40px] px-4 text-[14px]"><Phone size={16} aria-hidden />โทร</a>}
          {line && <a href={line} target="_blank" rel="noopener" className="btn btn-ghost min-h-[40px] px-4 text-[14px]"><MessageCircle size={16} aria-hidden />LINE</a>}
        </div>
      )}
    </div>
  );
}

export function ServiceList({ s, services }: { s: Section; services: Service[] }) {
  const list = services.filter((g) => !isBookingItem(g));
  if (list.length === 0) return null;
  return (
    <SectionShell id="services">
      <SectionHeading title={s.title ?? 'บริการหลังการขาย'} subtitle={s.subtitle} />
      <Rail cols={4}>
        {list.map((g) => (
          <article key={g.id} id={`svc-${g.id}`} className="scroll-mt-32 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
            <Media src={g.image} slot="service" alt={g.title} className="aspect-[3/2] w-full" />
            <div className="p-5">
              <h3 className="text-lg font-bold">{g.title}</h3>
              {g.subtitle && <p className="mt-0.5 text-[14px] text-steel">{g.subtitle}</p>}
              {g.description && <p className="mt-2 text-[15px]">{g.description}</p>}
            </div>
          </article>
        ))}
      </Rail>
    </SectionShell>
  );
}

export function ServicePackage({ s }: { s: Section }) {
  return (
    <div className="container-x pb-14">
      <div className="grid overflow-hidden rounded-[var(--radius-card)] bg-navy text-white md:grid-cols-[1fr_1fr]">
        <div className="flex flex-col justify-center p-7 sm:p-10">
          <h2 className="text-[28px] font-bold sm:text-[32px]"><span className="text-chrome">{s.title}</span></h2>
          {s.subtitle && <p className="mt-2 text-white/75">{s.subtitle}</p>}
          <Link href={s.cta_url ?? '/promotions?cat=after-sales#all'} className="btn btn-primary mt-6 self-start">{s.cta_label ?? 'ดูโปรโมชั่นบริการ'}</Link>
        </div>
        <Media src={s.image} slot="section_banner" alt={s.title ?? ''} dark className="aspect-[16/9] w-full md:aspect-auto md:min-h-[260px]" />
      </div>
    </div>
  );
}
