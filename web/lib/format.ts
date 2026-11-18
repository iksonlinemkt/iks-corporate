export function formatPrice(n: number | null | undefined): string | null {
  if (n === null || n === undefined) return null;
  return n.toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

/** ปี ค.ศ. → พ.ศ. */
export function buddhistYear(year: number): number {
  return year + 543;
}

export function formatThaiDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Bangkok' });
}

export function telHref(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // หลายเบอร์ใช้เบอร์แรก · เบอร์แบบช่วง "02-751-1606-10" ใช้ "02-751-1606"
  const first = phone.split(/[,/]|\s+(?:หรือ|ถึง)\s+/)[0].trim().replace(/^(.*\d{4})-\d{1,2}$/, '$1');
  const digits = first.replace(/[^0-9+]/g, '');
  return digits.length >= 9 ? `tel:${digits}` : null;
}

export function lineHref(lineIdOrUrl: string | null | undefined): string | null {
  if (!lineIdOrUrl) return null;
  if (/^https?:\/\//.test(lineIdOrUrl)) return lineIdOrUrl;
  const id = lineIdOrUrl.trim();
  return id.startsWith('@') ? `https://line.me/R/ti/p/${encodeURIComponent(id)}` : `https://line.me/ti/p/~${encodeURIComponent(id)}`;
}

/** ลิงก์นำทาง: เปิด Google Maps โหมดเส้นทางไปที่สาขา (มือถือเปิดแอป Maps ให้เลย) */
export function mapHref(b: {
  map_url: string | null; latitude: number | null; longitude: number | null; name: string; google_place_id?: string | null; address?: string | null;
}): string | null {
  const coords = b.latitude !== null && b.longitude !== null ? `${b.latitude},${b.longitude}` : null;
  if (b.google_place_id) {
    const dest = coords ?? `อีซูซุกรุงเทพเซลส์ ${b.name}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&destination_place_id=${encodeURIComponent(b.google_place_id)}`;
  }
  if (coords) return `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
  if (b.map_url) return b.map_url;
  // ยังไม่มีพิกัด → ให้ Google หาจากชื่อ + ที่อยู่
  if (b.address) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`อีซูซุกรุงเทพเซลส์ ${b.name} ${b.address}`)}`;
  return null;
}

/** แผนที่ฝังในหน้า (ไม่ต้องใช้ API key) */
export function mapEmbedSrc(b: { latitude: number | null; longitude: number | null; name: string; address: string | null }): string | null {
  const q = b.latitude !== null && b.longitude !== null
    ? `${b.latitude},${b.longitude}`
    : b.address ? `อีซูซุกรุงเทพเซลส์ ${b.name} ${b.address}` : null;
  return q ? `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&hl=th&output=embed` : null;
}

export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.MEDIA_PUBLIC_URL ?? '/media').replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
