import { Phone, Wrench } from 'lucide-react';
import { lineHref, telHref } from '@/lib/format';
import { FacebookIcon, InstagramIcon, LineIcon, TiktokIcon, YoutubeIcon } from './SocialIcons';
import type { Settings } from '@/lib/types';

/** แถบบนสุด: เบอร์ฝ่ายขาย / ศูนย์บริการ + ลิงก์โซเชียล (ช่องที่ว่างในหลังบ้านจะไม่แสดง) */
export function TopBar({ settings }: { settings: Settings }) {
  const sales = settings.phone_sales ?? settings.phone_main;
  const service = settings.phone_service;
  const line = settings.line_oa_url ?? lineHref(settings.line_oa_id);
  const social = [
    { href: settings.facebook_url, label: 'Facebook', Icon: FacebookIcon, hover: 'hover:bg-[#1877f2]' },
    { href: line, label: 'LINE', Icon: LineIcon, hover: 'hover:bg-[#06c755]' },
    { href: settings.youtube_url, label: 'YouTube', Icon: YoutubeIcon, hover: 'hover:bg-[#ff0033]' },
    { href: settings.instagram_url, label: 'Instagram', Icon: InstagramIcon, hover: 'hover:bg-[#d62976]' },
    { href: settings.tiktok_url, label: 'TikTok', Icon: TiktokIcon, hover: 'hover:bg-black' },
  ].filter((s): s is typeof s & { href: string } => !!s.href);
  const phones = [
    sales && { label: 'ฝ่ายขาย', value: sales, Icon: Phone },
    service && { label: 'ศูนย์บริการ', value: service, Icon: Wrench },
  ].filter(Boolean) as { label: string; value: string; Icon: typeof Phone }[];
  if (!phones.length && !social.length) return null;

  return (
    <div className="hidden border-b border-white/10 bg-[#04070e] text-white md:block">
      <div className="container-x flex h-10 items-center justify-end gap-5 text-[14px]">
        {phones.map(({ label, value, Icon }) => {
          const tel = telHref(value);
          const inner = <><Icon size={15} className="text-copper-light" aria-hidden /><span className="text-white/70">{label} :</span><span className="font-display font-semibold tracking-wide">{value}</span></>;
          return tel
            ? <a key={label} href={tel} className="inline-flex items-center gap-1.5 hover:text-copper-light">{inner}</a>
            : <span key={label} className="inline-flex items-center gap-1.5">{inner}</span>;
        })}
        {social.length > 0 && (
          <ul className="flex items-center gap-1 border-l border-white/15 pl-4">
            {social.map(({ href, label, Icon, hover }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener" aria-label={label} title={label}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors hover:text-white ${hover}`}>
                  <Icon size={17} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
