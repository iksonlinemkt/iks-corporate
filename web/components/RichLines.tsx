/** ข้อความหลายบรรทัด: บรรทัดปกติ = ย่อหน้า · ขึ้นต้นด้วย - หรือ • = ข้อ ๆ (ข้อความหน้า : เป็นตัวหนา) */
export function RichLines({ text, className = '' }: { text: string | null | undefined; className?: string }) {
  const lines = (text ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  const lead = lines.filter((l) => !/^[-•]/.test(l));
  const points = lines.filter((l) => /^[-•]/.test(l)).map((l) => l.replace(/^[-•]\s*/, ''));
  return (
    <div className={className}>
      {lead.map((l) => <p key={l} className="mt-3 text-[17px] leading-relaxed first:mt-0">{l}</p>)}
      {points.length > 0 && (
        <ul className="mt-5 space-y-3">
          {points.map((p) => {
            const i = p.indexOf(':');
            return (
              <li key={p} className="flex gap-3 text-[16px] leading-relaxed">
                <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-copper" aria-hidden />
                <span>{i > 0 && i < 30 ? <><strong className="font-semibold text-navy">{p.slice(0, i + 1)}</strong>{p.slice(i + 1)}</> : p}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
