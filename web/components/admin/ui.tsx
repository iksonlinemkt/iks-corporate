import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { STATUS_LABEL } from '@/lib/admin/entities';

export function StatusBadge({ status, visible = true }: { status: string; visible?: boolean }) {
  const cls = status === 'published'
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    : status === 'sample'
      ? 'bg-amber-50 text-amber-800 ring-amber-600/25'
      : 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-flex rounded px-2 py-0.5 text-[12px] font-semibold ring-1 ring-inset ${cls}`}>{STATUS_LABEL[status] ?? status}</span>
      {!visible && <span className="inline-flex rounded bg-slate-800 px-2 py-0.5 text-[12px] font-semibold text-white">ซ่อนอยู่</span>}
    </span>
  );
}

export function PageHead({
  title, desc, crumbs, actions,
}: {
  title: string;
  desc?: string | null;
  crumbs?: { href: string; label: string }[];
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="ตำแหน่ง" className="mb-2 flex flex-wrap items-center gap-1 text-[13px] text-steel">
            {crumbs.map((c) => (
              <span key={c.href} className="inline-flex items-center gap-1">
                <Link href={c.href} className="hover:text-copper-dark hover:underline">{c.label}</Link>
                <ChevronRight size={14} aria-hidden />
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[26px] font-bold leading-tight text-navy">{title}</h1>
        {desc && <p className="mt-1 max-w-2xl text-[14px] text-steel">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className = '', actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={`rounded-[var(--radius-card)] border border-line bg-white ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {title && <h2 className="text-[16px] font-bold text-navy">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'ok' | 'warn' | 'error'; children: React.ReactNode }) {
  const cls = {
    info: 'border-blue/20 bg-blue-soft text-navy',
    ok: 'border-emerald-600/25 bg-emerald-50 text-emerald-800',
    warn: 'border-amber-500/30 bg-amber-50 text-amber-900',
    error: 'border-red/30 bg-red-50 text-red-dark',
  }[tone];
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`mb-5 rounded-md border px-4 py-3 text-[14px] ${cls}`}>{children}</div>;
}

export function Thumb({ src, alt }: { src: string | null; alt: string }) {
  const base = (process.env.MEDIA_PUBLIC_URL ?? '/media').replace(/\/$/, '');
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`${base}/${src}`} alt={alt} className="h-12 w-[72px] shrink-0 rounded border border-line bg-mist object-cover" loading="lazy" />
  ) : (
    <span className="ph flex h-12 w-[72px] shrink-0 items-center justify-center rounded border border-line text-[10px] text-steel">ไม่มีรูป</span>
  );
}

export const btn = {
  primary: 'btn btn-primary min-h-[40px] px-4 text-[14px]',
  navy: 'btn btn-navy min-h-[40px] px-4 text-[14px]',
  ghost: 'btn btn-ghost min-h-[40px] bg-white px-4 text-[14px]',
  small: 'inline-flex h-8 items-center justify-center gap-1 rounded-md border border-line bg-white px-2.5 text-[13px] font-semibold text-navy hover:border-copper hover:text-copper-dark disabled:opacity-40',
};
