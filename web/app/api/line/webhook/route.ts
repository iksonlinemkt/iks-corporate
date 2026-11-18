import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Webhook ของ LINE bot ที่ใช้แจ้งเตือน Lead — มีไว้ "หารหัสกลุ่ม" อย่างเดียว
 * เชิญบอทเข้ากลุ่ม หรือพิมพ์ "รหัสกลุ่ม" / "groupid" ในกลุ่ม → บอทตอบรหัสกลุ่ม (ข้อความตอบกลับไม่นับโควตา LINE)
 */
const ASK = /^\s*(รหัสกลุ่ม|groupid|group id|id)\s*$/i;

async function reply(replyToken: string, text: string) {
  const token = process.env.LINE_CHANNEL_TOKEN;
  if (!token) return;
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ replyToken, messages: [{ type: 'text', text }] }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  const raw = await req.text();
  if (!secret) return NextResponse.json({ ok: false, error: 'LINE_CHANNEL_SECRET not set' }, { status: 503 });
  const sig = req.headers.get('x-line-signature') ?? '';
  const expect = createHmac('sha256', secret).update(raw).digest('base64');
  const a = Buffer.from(sig), b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { events?: { type: string; replyToken?: string; source?: { type?: string; groupId?: string; roomId?: string; userId?: string }; message?: { type?: string; text?: string } }[] };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: true }); }

  for (const ev of body.events ?? []) {
    const src = ev.source ?? {};
    const id = src.groupId ?? src.roomId;
    const asked = ev.type === 'message' && ev.message?.type === 'text' && ASK.test(ev.message.text ?? '');
    if (!ev.replyToken || !(ev.type === 'join' || asked)) continue;
    if (id) {
      await reply(ev.replyToken, `รหัสกลุ่มนี้คือ\n${id}\n\nคัดลอกไปใส่ในหลังบ้านเว็บ → ตั้งค่าเว็บ → แจ้งเตือนลูกค้าใหม่ → ช่อง "กลุ่ม LINE รวม" หรือช่องของสาขา`);
    } else if (asked) {
      await reply(ev.replyToken, 'พิมพ์คำนี้ในกลุ่ม LINE ที่เชิญบอทเข้าไปแล้ว เพื่อดูรหัสกลุ่ม');
    }
  }
  return NextResponse.json({ ok: true });
}

export function GET() {
  return NextResponse.json({ ok: true, info: 'LINE webhook สำหรับแจ้งเตือนลูกค้าใหม่' });
}
