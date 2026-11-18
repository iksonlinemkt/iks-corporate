import Link from 'next/link';
import { NAV, Wordmark } from './Brand';
import { Backdrop } from './Backdrop';
import { lineHref, telHref } from '@/lib/format';
import type { Settings } from '@/lib/types';

export function Footer({ settings, links = [] }: { settings: Settings; links?: { href: string; label: string }[] }) {
  const tel = telHref(settings.phone_main);
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);
  const social = [
    ['Facebook', settings.facebook_url],
    ['LINE', line],
    ['Instagram', settings.instagram_url],
    ['YouTube', settings.youtube_url],
    ['TikTok', settings.tiktok_url],
  ].filter(([, url]) => !!url) as [string, string][];
  const year = new Date().getFullYear() + 543;

  return (
    <footer className="relative overflow-hidden bg-navy-950 pb-24 text-white lg:pb-0">
      <Backdrop variant="band" />
      <div className="copper-metal h-[3px]" aria-hidden />
      <div className="container-x relative grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark light />
          {settings.hq_address && <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/75">{settings.hq_address}</p>}
          <div className="mt-4 space-y-1 text-[15px]">
            {tel && <p><a href={tel} className="text-gold font-display text-xl font-bold">{settings.phone_main}</a></p>}
            {settings.email_main && <p><a href={`mailto:${settings.email_main}`} className="text-white/75 hover:text-white">{settings.email_main}</a></p>}
          </div>
        </div>

        <nav aria-label="ลิงก์ในเว็บ">
          <p className="font-display text-[15px] font-bold text-copper-light">เมนู</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[15px]">
            {NAV.map((n) => (
              <li key={n.href}><Link href={n.href} className="text-white/85 hover:text-white">{n.label}</Link></li>
            ))}
          </ul>
        </nav>

        <div>
          {social.length > 0 && (
            <>
              <p className="font-display text-[15px] font-bold text-copper-light">ติดตามเรา</p>
              <ul className="mt-3 space-y-2 text-[15px]">
                {social.map(([name, url]) => (
                  <li key={name}><a href={url} target="_blank" rel="noopener" className="text-white/85 hover:text-white">{name}</a></li>
                ))}
              </ul>
            </>
          )}
          <Link href="/contact?type=quote" className="btn btn-primary mt-6">ขอใบเสนอราคา</Link>
        </div>
      </div>
      {links.length > 0 && (
        <nav aria-label="สาขาและพื้นที่" className="relative border-t border-white/10">
          <ul className="container-x flex flex-wrap gap-x-5 gap-y-2 py-5 text-[14px]">
            {links.map((l) => <li key={l.href}><Link href={l.href} className="text-white/70 hover:text-white">{l.label}</Link></li>)}
          </ul>
        </nav>
      )}
      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-wrap justify-between gap-2 py-5 text-[13px] text-white/55">
          <p>© {year} {settings.company_legal ?? settings.company_name_th ?? 'อีซูซุกรุงเทพเซลส์'}</p>
          <p>ผู้จำหน่ายรถยนต์อีซูซุ{settings.group_name ? ` ในเครือ${settings.group_name}` : ''} · อีซูซุกรุงเทพ.com</p>
        </div>
      </div>
    </footer>
  );
}
