import 'server-only';

/**
 * ลิงก์ Facebook แบบแชร์ (facebook.com/share/v/…, /share/r/…, fb.watch/…) ฝังในเว็บอื่นไม่ได้
 * → ให้เซิร์ฟเวอร์ตามลิงก์ไปหาลิงก์วิดีโอจริง (facebook.com/<เพจ>/videos/<id>) แล้วจำไว้ 6 ชั่วโมง
 */
const cache = new Map<string, { url: string; at: number; ok: boolean }>();
const TTL = 6 * 3600_000;
const TTL_FAIL = 2 * 60_000; // แปลงไม่สำเร็จ: ลองใหม่ทุก 2 นาที
// Facebook ตอบ 400 กับคำขอที่ไม่เหมือนเบราว์เซอร์ → ลองแบบบอทแชร์ลิงก์ของ Facebook ก่อน แล้วค่อยแบบเบราว์เซอร์เต็มรูปแบบ
const HEADER_SETS: Record<string, string>[] = [
  { 'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', accept: 'text/html' },
  {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'th-TH,th;q=0.9,en;q=0.8',
    'sec-fetch-mode': 'navigate', 'sec-fetch-site': 'none', 'sec-fetch-dest': 'document', 'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
  },
];

const fbHost = (h: string) => h.replace(/^(www|m|web|mbasic)\./, '');
export function isFacebookShareLink(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    const h = fbHost(u.hostname);
    return h === 'fb.watch' || ((h === 'facebook.com' || h === 'fb.com') && /^\/share\//.test(u.pathname));
  } catch { return false; }
}

/** ลิงก์วิดีโอที่ใช้ฝังได้ (videos / watch / reel) */
function isVideoUrl(u: URL) {
  return (fbHost(u.hostname) === 'facebook.com') && !/^\/share\//.test(u.pathname)
    && (/\/videos\/|\/reel\/|^\/watch/.test(u.pathname));
}

function clean(u: URL) {
  const out = new URL(u.toString());
  const v = out.searchParams.get('v');
  out.search = v ? `?v=${v}` : '';
  out.hash = '';
  out.hostname = 'www.facebook.com';
  return out.toString();
}

/** ตามลิงก์ (สูงสุด 5 ทอด) จนเจอลิงก์วิดีโอ · ไม่เจอ = null */
async function follow(input: string, headers: Record<string, string>, fetchImpl: typeof fetch): Promise<string | null> {
  try {
    let cur = new URL(input);
    for (let i = 0; i < 5; i++) {
      const r = await fetchImpl(cur.toString(), { redirect: 'manual', headers, signal: AbortSignal.timeout(6000) });
      const loc = r.headers.get('location');
      if (loc) {
        const next = new URL(loc, cur);
        // หน้า login ของ Facebook มักมีลิงก์ปลายทางใน ?next=
        const nextParam = /\/login/.test(next.pathname) ? next.searchParams.get('next') : null;
        cur = nextParam ? new URL(nextParam) : next;
        if (isVideoUrl(cur)) return clean(cur);
        continue;
      }
      if (r.ok) {
        const html = (await r.text()).slice(0, 400_000);
        const og = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)
          ?? html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
        if (og) {
          const u = new URL(og[1].replace(/&amp;/g, '&'));
          if (isVideoUrl(u)) return clean(u);
        }
      }
      return null;
    }
  } catch {
    /* ต่อ Facebook ไม่ได้ */
  }
  return null;
}

export async function resolveVideoUrl(raw: string | null | undefined, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  if (!raw) return raw ?? null;
  const input = raw.trim();
  if (!isFacebookShareLink(input)) return input;
  const hit = cache.get(input);
  if (hit && Date.now() - hit.at < (hit.ok ? TTL : TTL_FAIL)) return hit.url;

  let result = input;
  for (const headers of HEADER_SETS) {
    const found = await follow(input, headers, fetchImpl);
    if (found) { result = found; break; }
  }
  cache.set(input, { url: result, at: Date.now(), ok: result !== input });
  return result;
}
