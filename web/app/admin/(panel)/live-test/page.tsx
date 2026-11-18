import { PageHead, Notice } from '@/components/admin/ui';
import { liveControlAction } from '@/app/admin/actions';
import { campaignPhase } from '@/lib/content';
import type { Campaign } from '@/lib/types';
import { inputCls } from '@/components/admin/FormBits';
import { adminDb } from '@/lib/db';
import { embedVideo } from '@/lib/video';
import { isFacebookShareLink, resolveVideoUrl } from '@/lib/videoResolve';

export const metadata = { title: 'ควบคุมไลฟ์' };

const PHASE_LABEL = { upcoming: 'ก่อนไลฟ์ (ทีเซอร์ + นับถอยหลัง)', live: 'กำลังไลฟ์ (LIVE สีแดง)', ended: 'จบแล้ว (คลิปย้อนหลัง)' } as const;
const DONE: Record<string, string> = { start: 'เริ่มไลฟ์แล้ว — เว็บแสดงไลฟ์ให้ลูกค้าทุกคนแล้ว', end: 'จบไลฟ์แล้ว — เว็บแสดงคลิปย้อนหลัง', upcoming: 'กลับเป็นก่อนไลฟ์แล้ว', auto: 'ตั้งเป็นอัตโนมัติตามเวลาแล้ว', show: 'แสดงแคมเปญและเมนู "รุ่นใหม่" แล้ว', save: 'บันทึกลิงก์แล้ว' };

export default async function LiveTestPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { rows } = await adminDb().query(
    "select * from public.campaigns where status = 'published' order by is_visible desc, sort_order, created_at limit 1");
  const camp = (rows[0] as Campaign & { is_visible: boolean; show_in_nav: boolean }) ?? null;
  const saved: string = camp?.live_url ?? '';
  const phase = camp ? campaignPhase(camp) : null;
  const check = sp.check?.trim() ?? '';
  const resolved = check ? await resolveVideoUrl(check) : null;
  const parsed = resolved ? embedVideo(resolved) : null;
  const shareStuck = !!check && isFacebookShareLink(check) && resolved === check;

  return (
    <>
      <PageHead
        title="ควบคุมไลฟ์"
        desc="ส่วนบน = กดเริ่ม/จบไลฟ์บนเว็บจริง (ลูกค้าเห็นทันที) · ส่วนล่าง = ทดสอบลิงก์ เห็นเฉพาะทีมงาน"
        crumbs={[{ href: '/admin', label: 'ภาพรวม' }, { href: '/admin/c/campaigns', label: 'เปิดตัวรุ่นใหม่ / ไลฟ์' }]}
      />
      {sp.done && DONE[sp.done] && <div className="mb-5"><Notice tone="ok">{DONE[sp.done]}</Notice></div>}
      {sp.err === 'nourl' && <div className="mb-5"><Notice tone="error">ยังไม่มีลิงก์ไลฟ์ — วางลิงก์ Facebook ก่อนกดเริ่มไลฟ์</Notice></div>}
      {sp.err === 'nocampaign' && <div className="mb-5"><Notice tone="error">ไม่มีแคมเปญที่เผยแพร่ — ไปที่ &quot;เปิดตัวรุ่นใหม่ / ไลฟ์&quot; แล้วกดเผยแพร่แคมเปญก่อน</Notice></div>}

      <section className="mb-8 rounded-[var(--radius-card)] border-2 border-copper/50 bg-white p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[19px] font-bold">ไลฟ์บนเว็บจริง</h2>
            {camp ? (
              <p className="mt-1 text-[14px] text-steel">แคมเปญ: <strong className="text-navy">{camp.title}</strong> · ตอนนี้ลูกค้าเห็น: <strong className={phase === 'live' ? 'text-red' : 'text-navy'}>{phase ? PHASE_LABEL[phase] : '-'}</strong>{camp.mode === 'auto' ? ' (อัตโนมัติตามเวลา)' : ''}</p>
            ) : <p className="mt-1 text-[14px] text-red">ยังไม่มีแคมเปญที่เผยแพร่</p>}
          </div>
          {phase === 'live' && <span className="inline-flex items-center gap-2 rounded-full bg-red px-3 py-1 text-[13px] font-bold text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />LIVE อยู่</span>}
        </div>
        {camp && (!camp.is_visible || !camp.show_in_nav) && (
          <form action={liveControlAction} className="mb-4">
            <input type="hidden" name="act" value="show" />
            <Notice tone="warn">
              แคมเปญนี้{!camp.is_visible ? 'ถูกซ่อนอยู่ (ลูกค้าไม่เห็น)' : 'ไม่ได้แสดงเป็นเมนู'} — เมนู &quot;รุ่นใหม่&quot; จึงไม่ขึ้น{' '}
              <button type="submit" className="ml-1 font-semibold underline">กดเพื่อแสดงแคมเปญ + เมนู</button>
            </Notice>
          </form>
        )}
        <form action={liveControlAction} className="space-y-4">
          <div>
            <label htmlFor="live_url" className="mb-1.5 block text-[14px] font-semibold">ลิงก์ไลฟ์ Facebook (วางลิงก์จากปุ่มแชร์ได้)</label>
            <input id="live_url" name="live_url" type="url" defaultValue={saved} placeholder="https://www.facebook.com/share/v/…" className={inputCls} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <button type="submit" name="act" value="start" className="btn min-h-[52px] bg-red text-[16px] font-bold text-white hover:bg-red-dark">● เริ่มไลฟ์ (ขึ้นเว็บทันที)</button>
            <button type="submit" name="act" value="end" className="btn btn-navy min-h-[52px] text-[16px]">■ จบไลฟ์ (แสดงย้อนหลัง)</button>
            <button type="submit" name="act" value="upcoming" className="btn min-h-[52px] border border-line text-[16px]">↺ กลับเป็นก่อนไลฟ์</button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-steel">
            <button type="submit" name="act" value="save" className="font-semibold text-navy underline">บันทึกลิงก์อย่างเดียว</button>
            <button type="submit" name="act" value="auto" className="font-semibold text-navy underline">ใช้โหมดอัตโนมัติตามเวลาเริ่ม</button>
            <span>ลองลิงก์ก่อนได้ในส่วน &quot;ทดสอบ&quot; ด้านล่าง</span>
          </div>
        </form>
      </section>

      <h2 className="mb-3 text-[17px] font-bold">ทดสอบลิงก์ (เห็นเฉพาะทีมงาน)</h2>
      {sp.stopped && <div className="mb-5"><Notice tone="ok">หยุดทดสอบแล้ว หน้าเว็บกลับเป็นสถานะจริง</Notice></div>}
      {sp.error === 'url' && <div className="mb-5"><Notice tone="error">ลิงก์ไม่ถูกต้อง ต้องขึ้นต้นด้วย https://</Notice></div>}

      <form action="/admin/live-test-go" method="get" target="_blank" className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
        <div>
          <label htmlFor="url" className="mb-1.5 block text-[14px] font-semibold">ลิงก์วิดีโอ / ไลฟ์</label>
          <input id="url" name="url" type="url" required defaultValue={check || saved} placeholder="https://www.facebook.com/ชื่อเพจ/videos/123456789" className={inputCls} />
          <p className="mt-1 text-[12.5px] text-steel">
            ใช้ได้: ลิงก์จากปุ่มแชร์ (facebook.com/share/v/…) · facebook.com/…/videos/… · facebook.com/watch/?v=… · fb.watch/… · YouTube · วิดีโอต้องเป็นสาธารณะจากเพจ
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phase" className="mb-1.5 block text-[14px] font-semibold">ดูในสถานะ</label>
            <select id="phase" name="phase" defaultValue="live" className={inputCls}>
              <option value="live">กำลังไลฟ์ (LIVE สีแดง)</option>
              <option value="upcoming">ก่อนไลฟ์ (ทีเซอร์ + นับถอยหลัง)</option>
              <option value="ended">จบแล้ว (คลิปย้อนหลัง)</option>
            </select>
          </div>
          <div>
            <label htmlFor="to" className="mb-1.5 block text-[14px] font-semibold">เปิดหน้า</label>
            <select id="to" name="to" defaultValue="live" className={inputCls}>
              <option value="live">หน้าไลฟ์ (/live)</option>
              <option value="home">หน้าแรก</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn btn-primary min-h-[42px] px-5 text-[15px]">เปิดดูหน้าเว็บ (แท็บใหม่)</button>
          <a href="/admin/live-test-go?stop=1" className="btn min-h-[42px] border border-line px-5 text-[15px]">หยุดทดสอบ</a>
        </div>
      </form>

      <form method="get" className="mt-6 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
        <label htmlFor="check" className="mb-1.5 block text-[14px] font-semibold">เช็กรูปแบบลิงก์อย่างเดียว</label>
        <div className="flex flex-wrap gap-3">
          <input id="check" name="check" defaultValue={check} placeholder="วางลิงก์แล้วกดเช็ก" className={`${inputCls} min-w-0 flex-1`} />
          <button type="submit" className="btn min-h-[42px] border border-line px-5 text-[15px]">เช็ก</button>
        </div>
        {check && (
          <div className="mt-3">
            {resolved && resolved !== check && (
              <p className="mb-3 break-all rounded-md bg-mist px-3 py-2 text-[13px]">ลิงก์แชร์ถูกแปลงเป็นลิงก์วิดีโอจริง: <span className="font-semibold">{resolved}</span></p>
            )}
            {shareStuck ? (
              <Notice tone="error">นี่เป็นลิงก์จากปุ่ม &quot;แชร์&quot; ซึ่งระบบแปลงเป็นลิงก์วิดีโอไม่ได้ (โพสต์อาจไม่ใช่สาธารณะ หรือมาจากโปรไฟล์ส่วนตัว) · ให้เปิดวิดีโอในคอม คลิกที่เวลาโพสต์ แล้วคัดลอกลิงก์จากช่อง URL ด้านบน (แบบ facebook.com/ชื่อเพจ/videos/…)</Notice>
            ) : parsed ? (
              <Notice tone="ok">รูปแบบลิงก์ถูกต้อง ({parsed.provider}{parsed.vertical ? ' · แนวตั้ง' : ''}) ถ้าเปิดดูแล้ววิดีโอไม่เล่น แปลว่าโพสต์ไม่ได้ตั้งเป็นสาธารณะ หรือเพจปิดการฝังวิดีโอ</Notice>
            ) : (
              <Notice tone="error">ระบบไม่รู้จักลิงก์นี้ ใช้ลิงก์ Facebook แบบ /videos/… หรือ /watch/?v=… หรือ YouTube · TikTok LIVE ฝังในเว็บไม่ได้</Notice>
            )}
          </div>
        )}
      </form>

      <div className="mt-6">
        <Notice tone="info">
          ใช้จริงวันไลฟ์: ไปที่ &quot;เปิดตัวรุ่นใหม่ / ไลฟ์&quot; → ใส่ลิงก์ในช่อง &quot;ลิงก์ไลฟ์&quot; และตั้งเวลาเริ่ม (โหมดอัตโนมัติ) เว็บจะเปลี่ยนเป็นไลฟ์เองเมื่อถึงเวลา และส่วนไลฟ์จะขึ้นบนสุดของหน้าแรกระหว่างไลฟ์
        </Notice>
      </div>
    </>
  );
}
