/**
 * มือถือ: เลื่อนแนวนอนทีละการ์ด (ประหยัดความยาวหน้า)
 * จอใหญ่: grid ตามจำนวนคอลัมน์
 */
export function Rail({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 | 5 }) {
  const grid = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4', 5: 'sm:grid-cols-3 lg:grid-cols-5' }[cols];
  return (
    <div
      className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 ${grid}
        [&>*]:w-[82%] [&>*]:shrink-0 [&>*]:snap-start sm:[&>*]:w-auto`}
    >
      {children}
    </div>
  );
}

/** ปุ่มกรองแบบลิงก์ (ทำงานได้แม้ปิด JavaScript) */
export function FilterChips({
  items, active, basePath, anchor,
}: {
  items: { value: string; label: string }[];
  active: string;
  basePath: string;
  anchor?: string;
}) {
  return (
    <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="list">
      {items.map((it) => {
        const on = it.value === active;
        const href = `${basePath}${it.value ? `?cat=${encodeURIComponent(it.value)}` : ''}${anchor ? `#${anchor}` : ''}`;
        return (
          <li key={it.value || 'all'} className="shrink-0">
            <a
              href={href}
              aria-current={on ? 'true' : undefined}
              className={`block whitespace-nowrap rounded-md border px-4 py-2.5 font-display text-[15px] font-semibold transition-colors ${
                on ? 'border-navy bg-navy text-white' : 'border-line bg-white text-navy hover:border-copper'
              }`}
            >
              {it.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
