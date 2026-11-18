import Link from 'next/link';
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil } from 'lucide-react';
import { moveAction, toggleVisibleAction } from '@/app/admin/actions';
import type { Entity } from '@/lib/admin/entities';
import type { ListRow } from '@/lib/admin/crud';
import { StatusBadge, Thumb, btn } from './ui';

/** ตารางรายการ: รูป / ชื่อ / สถานะ / เลื่อนลำดับ / ซ่อน-แสดง / แก้ไข */
export function EntityList({ e, rows, back }: { e: Entity; rows: ListRow[]; back?: string }) {
  if (!rows.length) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-10 text-center text-[15px] text-steel">
        ยังไม่มีรายการ{e.canCreate ? ' กดปุ่ม "เพิ่ม" ด้านบนเพื่อเริ่ม' : ''}
      </div>
    );
  }
  const q = back ? `?back=${encodeURIComponent(back)}` : '';
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
      {rows.map((r, i) => (
        <li key={r.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap ${!r.is_visible ? 'bg-mist/70' : ''}`}>
          {e.imageField !== undefined && <Thumb src={r.image} alt={r.title} />}
          <div className="min-w-0 flex-1">
            <Link href={`/admin/c/${e.key}/${r.id}${q}`} className="block truncate font-display text-[16px] font-bold text-navy hover:text-copper-dark">
              {r.title || '(ไม่มีชื่อ)'}
            </Link>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <StatusBadge status={r.status} visible={r.is_visible} />
              {r.subtitle && <span className="truncate text-[13px] text-steel">{r.subtitle}</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <form action={moveAction.bind(null, e.key, r.id, 'up')}>
              <button className={btn.small} disabled={i === 0} aria-label={`เลื่อน ${r.title} ขึ้น`} title="เลื่อนขึ้น"><ArrowUp size={15} /></button>
            </form>
            <form action={moveAction.bind(null, e.key, r.id, 'down')}>
              <button className={btn.small} disabled={i === rows.length - 1} aria-label={`เลื่อน ${r.title} ลง`} title="เลื่อนลง"><ArrowDown size={15} /></button>
            </form>
            <form action={toggleVisibleAction.bind(null, e.key, r.id)}>
              <button className={btn.small} title={r.is_visible ? 'ซ่อนจากหน้าเว็บ' : 'แสดงบนหน้าเว็บ'}>
                {r.is_visible ? <><EyeOff size={15} />ซ่อน</> : <><Eye size={15} />แสดง</>}
              </button>
            </form>
            <Link href={`/admin/c/${e.key}/${r.id}${q}`} className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-navy px-3 text-[13px] font-semibold text-white hover:bg-navy-2">
              <Pencil size={14} />แก้ไข
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
