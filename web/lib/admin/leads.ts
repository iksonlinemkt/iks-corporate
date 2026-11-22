import 'server-only';
import { adminDb } from '@/lib/db';
import { LEAD_STATUS, LEAD_TYPES } from './entities';

export type LeadFilter = { status?: string; type?: string; q?: string; from?: string; to?: string };

export function cleanFilter(sp: Record<string, string | undefined>): LeadFilter {
  const d = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  return {
    status: sp.status && sp.status in LEAD_STATUS ? sp.status : undefined,
    type: sp.type && sp.type in LEAD_TYPES ? sp.type : undefined,
    q: sp.q?.trim().slice(0, 60) || undefined,
    from: d(sp.from),
    to: d(sp.to),
  };
}

export async function queryLeads(f: LeadFilter, limit = 50, offset = 0) {
  const where: string[] = [];
  const args: unknown[] = [];
  const add = (sql: string, v: unknown) => { args.push(v); where.push(sql.replace('?', `$${args.length}`)); };
  if (f.status) add('l.status = ?', f.status);
  if (f.type) add('l.lead_type = ?', f.type);
  if (f.q) add("(l.full_name ilike ? or l.phone ilike $X or coalesce(l.line_id,'') ilike $X or coalesce(l.email,'') ilike $X)".replace(/\$X/g, `$${args.length + 1}`), `%${f.q}%`);
  if (f.from) add("l.created_at >= (?::date)::timestamp at time zone 'Asia/Bangkok'", f.from);
  if (f.to) add("l.created_at < ((?::date) + 1)::timestamp at time zone 'Asia/Bangkok'", f.to);
  const w = where.length ? `where ${where.join(' and ')}` : '';
  const db = adminDb();
  const [{ rows }, { rows: [c] }] = await Promise.all([
    db.query(
      `select l.*, v.name as vehicle_name, b.name as branch_name, u.full_name as assignee, u.email as assignee_email
         from public.leads l
         left join public.vehicles v on v.id = l.vehicle_id
         left join public.branches b on b.id = l.branch_id
         left join public.admin_users u on u.id = l.assigned_to
       ${w} order by l.created_at desc limit ${Number(limit)} offset ${Number(offset)}`,
      args,
    ),
    db.query(`select count(*)::int as n from public.leads l ${w}`, args),
  ]);
  return { rows, total: c.n as number };
}
