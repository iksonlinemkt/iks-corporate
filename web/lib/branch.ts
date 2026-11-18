import type { Branch } from './types';

/** ลิงก์หน้าสาขา: /branches/<slug> (อ่านง่ายและตรงกับคำค้น เช่น "อีซูซุ บางนา") */
const SLUG: Record<string, string> = { BN: 'bangna', SR: 'srinakarin', BST: 'bang-sao-thong', KS: 'kaset' };

export const branchSlug = (b: Pick<Branch, 'code'>) => SLUG[b.code.toUpperCase()] ?? b.code.toLowerCase().replace(/[^a-z0-9-]/g, '-');
export const branchArea = (b: Pick<Branch, 'name'>) => b.name.replace(/^สาขา\s*/, '').trim();
export const branchPath = (b: Pick<Branch, 'code'>) => `/branches/${branchSlug(b)}`;

/** พื้นที่ใกล้เคียง "รัชโยธิน, ม.เกษตรศาสตร์" → ['รัชโยธิน', 'ม.เกษตรศาสตร์'] */
export const branchNearby = (b: Pick<Branch, 'nearby'>) =>
  (b.nearby ?? '').split(/[,\n、·]/).map((x) => x.trim()).filter(Boolean).slice(0, 8);
