import 'server-only';

/**
 * Google Places API (New) — ใช้ฝั่งเซิร์ฟเวอร์เท่านั้น (key ไม่ถูกส่งไปเบราว์เซอร์)
 * - คะแนน/รีวิวของสาขา: เก็บไว้ในหน่วยความจำ 12 ชม. (ประมาณ 2 ครั้ง/สาขา/วัน)
 * - ค้นหาสถานที่: ใช้ในหลังบ้านตอนตั้งค่าสาขา
 * ไม่มี GOOGLE_MAPS_API_KEY = ปิดฟีเจอร์นี้เงียบๆ (หน้าเว็บส่วนอื่นทำงานปกติ)
 */

const BASE = (process.env.GOOGLE_PLACES_BASE ?? 'https://places.googleapis.com').replace(/\/$/, '');
const TTL_OK = 12 * 60 * 60 * 1000;
const TTL_FAIL = 30 * 60 * 1000;

export const hasGoogleKey = () => !!process.env.GOOGLE_MAPS_API_KEY;

export type PlaceReview = {
  author: string;
  authorUri: string | null;
  photo: string | null;
  rating: number;
  text: string;
  relative: string | null;
  publishTime: string | null;
};

export type PlaceRating = {
  rating: number | null;
  count: number;
  uri: string | null;
  reviews: PlaceReview[];
};

type Cached = { at: number; ok: boolean; data: PlaceRating | null };
const g = globalThis as unknown as { __iksPlaces?: Map<string, Cached>; __iksPlacesPending?: Map<string, Promise<PlaceRating | null>> };
const cache = (g.__iksPlaces ??= new Map());
const pending = (g.__iksPlacesPending ??= new Map());

async function call(path: string, init: RequestInit & { fieldMask: string }): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    return await fetch(`${BASE}${path}`, {
      ...init,
      cache: 'no-store',
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY ?? '',
        'X-Goog-FieldMask': init.fieldMask,
      },
    });
  } finally {
    clearTimeout(t);
  }
}

type RawReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

async function fetchPlace(placeId: string): Promise<PlaceRating | null> {
  const res = await call(`/v1/places/${encodeURIComponent(placeId)}?languageCode=th&regionCode=TH`, {
    method: 'GET',
    fieldMask: 'rating,userRatingCount,googleMapsUri,reviews',
  });
  if (!res.ok) {
    console.error(`[google] place ${placeId}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    return null;
  }
  const j = (await res.json()) as { rating?: number; userRatingCount?: number; googleMapsUri?: string; reviews?: RawReview[] };
  return {
    rating: typeof j.rating === 'number' ? j.rating : null,
    count: j.userRatingCount ?? 0,
    uri: j.googleMapsUri ?? null,
    reviews: (j.reviews ?? []).map((r) => ({
      author: r.authorAttribution?.displayName ?? 'ผู้ใช้ Google',
      authorUri: r.authorAttribution?.uri ?? null,
      photo: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? 0,
      // ข้อความต้นฉบับ (ไม่ใช่คำแปลอัตโนมัติ)
      text: (r.originalText?.text ?? r.text?.text ?? '').trim(),
      relative: r.relativePublishTimeDescription ?? null,
      publishTime: r.publishTime ?? null,
    })),
  };
}

/** คะแนน + รีวิวของสถานที่ (null = ไม่มี key / เรียกไม่สำเร็จ) */
export async function getPlaceRating(placeId: string | null | undefined): Promise<PlaceRating | null> {
  if (!placeId || !hasGoogleKey()) return null;
  const hit = cache.get(placeId);
  if (hit && Date.now() - hit.at < (hit.ok ? TTL_OK : TTL_FAIL)) return hit.data;
  // คำขอพร้อมกันหลายหน้า → ยิง Google ครั้งเดียว
  const inflight = pending.get(placeId);
  if (inflight) return inflight;
  const p = fetchPlace(placeId)
    .catch((e) => {
      console.error(`[google] place ${placeId}:`, (e as Error).message);
      return null;
    })
    .then((data) => {
      // เรียกไม่สำเร็จแต่เคยมีข้อมูล → ใช้ของเดิมไปก่อน
      const keep = data ?? hit?.data ?? null;
      cache.set(placeId, { at: Date.now(), ok: !!data, data: keep });
      pending.delete(placeId);
      return keep;
    });
  pending.set(placeId, p);
  return p;
}

export type PlaceCandidate = {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  uri: string | null;
  rating: number | null;
  count: number;
};

/** ค้นหาสถานที่ด้วยข้อความ (หลังบ้าน) */
export async function searchPlaces(query: string): Promise<PlaceCandidate[]> {
  const res = await call('/v1/places:searchText', {
    method: 'POST',
    fieldMask: 'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.rating,places.userRatingCount',
    body: JSON.stringify({ textQuery: query, languageCode: 'th', regionCode: 'TH', pageSize: 5 }),
  });
  if (!res.ok) {
    const body = (await res.text()).slice(0, 300);
    console.error(`[google] search: HTTP ${res.status} ${body}`);
    throw new Error(res.status === 403 ? 'Google ปฏิเสธ API key (ตรวจว่าเปิด Places API (New) และตั้งค่า key ถูกต้อง)' : `Google ตอบกลับผิดพลาด (${res.status})`);
  }
  const j = (await res.json()) as {
    places?: {
      id: string; displayName?: { text?: string }; formattedAddress?: string; location?: { latitude?: number; longitude?: number };
      googleMapsUri?: string; rating?: number; userRatingCount?: number;
    }[];
  };
  return (j.places ?? []).map((p) => ({
    id: p.id,
    name: p.displayName?.text ?? '(ไม่มีชื่อ)',
    address: p.formattedAddress ?? null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
    uri: p.googleMapsUri ?? null,
    rating: p.rating ?? null,
    count: p.userRatingCount ?? 0,
  }));
}

/** ล้างแคชของสาขาที่เพิ่งแก้ในหลังบ้าน */
export function forgetPlace(placeId: string | null | undefined) {
  if (placeId) cache.delete(placeId);
}
