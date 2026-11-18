import { ChevronDown } from 'lucide-react';
import { JsonLd } from './JsonLd';
import type { Faq } from '@/lib/types';

/** คำถามที่พบบ่อย (เปิด-ปิดได้) + FAQPage schema */
export function FaqList({ items }: { items: Faq[] }) {
  if (!items.length) return null;
  return (
    <>
      <div className="max-w-3xl divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
        {items.map((f, i) => (
          <details key={f.id} className="group" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 font-display text-[17px] font-bold text-navy hover:bg-mist/60 [&::-webkit-details-marker]:hidden">
              {f.question}
              <ChevronDown size={20} className="mt-1 shrink-0 text-copper-dark transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="whitespace-pre-line px-5 pb-5 text-[15px] leading-relaxed text-ink">{f.answer}</p>
          </details>
        ))}
      </div>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
      }} />
    </>
  );
}
