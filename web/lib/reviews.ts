import 'server-only';
import { cache } from 'react';
import { getBranches } from './content';
import { getPlaceRating, type PlaceReview } from './google';

export type BranchRating = { id: string; name: string; rating: number; count: number; uri: string | null };
export type ShownReview = PlaceReview & { key: string; branch: string; placeUri: string | null };

export type ReviewData = {
  /** คะแนนของแต่ละสาขา (เฉพาะสาขาที่เชื่อม Google แล้ว) */
  byBranch: Map<string, BranchRating>;
  /** คะแนนรวมทุกสาขา (เฉลี่ยถ่วงตามจำนวนรีวิว) */
  overall: { rating: number; count: number } | null;
  /** รีวิว 4–5 ดาวที่มีข้อความ เรียงใหม่ไปเก่า สลับสาขา */
  reviews: ShownReview[];
};

const MIN_STARS = 4;
const MIN_TEXT = 15;
const MAX_SHOWN = 12;

export const getReviewData = cache(async (): Promise<ReviewData> => {
  const branches = (await getBranches()).filter((b) => b.google_place_id);
  const results = await Promise.all(branches.map(async (b) => ({ b, r: await getPlaceRating(b.google_place_id) })));

  const byBranch = new Map<string, BranchRating>();
  const perBranch: ShownReview[][] = [];
  let sum = 0;
  let count = 0;

  for (const { b, r } of results) {
    if (!r) continue;
    if (r.rating !== null && r.count > 0) {
      byBranch.set(b.id, { id: b.id, name: b.name, rating: r.rating, count: r.count, uri: r.uri });
      sum += r.rating * r.count;
      count += r.count;
    }
    perBranch.push(
      r.reviews
        .filter((x) => x.rating >= MIN_STARS && x.text.length >= MIN_TEXT)
        .sort((a, z) => (z.publishTime ?? '').localeCompare(a.publishTime ?? ''))
        .map((x, i) => ({ ...x, key: `${b.id}-${i}`, branch: b.name, placeUri: r.uri })),
    );
  }

  // สลับสาขา (บางนา, ศรีนครินทร์, … แล้ววนใหม่) ให้เห็นครบทุกสาขา
  const reviews: ShownReview[] = [];
  for (let i = 0; reviews.length < MAX_SHOWN && perBranch.some((l) => l.length > i); i++) {
    for (const list of perBranch) if (list[i] && reviews.length < MAX_SHOWN) reviews.push(list[i]);
  }

  return {
    byBranch,
    overall: count > 0 ? { rating: Math.round((sum / count) * 10) / 10, count } : null,
    reviews,
  };
});
