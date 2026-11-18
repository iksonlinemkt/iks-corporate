import 'server-only';
import { cache } from 'react';
import { adminDb, publicDb } from './db';
import { getLiveTest, isPreview } from './preview';
import { resolveVideoUrl } from './videoResolve';
import type {
  Area,
  Activity, Branch, Highlight, HeroSlide, NamedImageItem, Page, Promotion, PromotionCategory,
  Section, Service, Settings, Staff, TimelineEvent, Vehicle, VehicleCategory, Industry, VehicleGrade, Faq, Campaign, GalleryImage, Community, CommunityPost } from './types';

/**
 * คนทั่วไป  → อ่านจาก view published_<table> ด้วย role iks_web_public (เห็นเฉพาะที่เผยแพร่)
 * โหมดพรีวิว → อ่านตารางจริงด้วย role iks_web_admin (เห็นข้อมูลตัวอย่าง/ร่างด้วย)
 */
const ctx = cache(async () => {
  const preview = await isPreview();
  return { preview, db: preview ? adminDb() : publicDb() };
});

const WINDOW = '(starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())';

async function list<T>(table: string, opts: { where?: string; order?: string; params?: unknown[]; windowed?: boolean } = {}) {
  const { preview, db } = await ctx();
  const conds: string[] = [];
  if (preview) {
    conds.push('is_visible');
    if (opts.windowed) conds.push(WINDOW);
  }
  if (opts.where) conds.push(opts.where);
  const from = preview ? `public.${table}` : `public.published_${table}`;
  const sql = `select * from ${from}${conds.length ? ' where ' + conds.join(' and ') : ''} order by ${opts.order ?? 'sort_order, created_at'}`;
  const { rows } = await db.query(sql, opts.params ?? []);
  return rows as T[];
}

export const getPreviewState = cache(async () => (await ctx()).preview);

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await list<{ key: string; value: string | null }>('site_settings');
  const out: Settings = {};
  for (const r of rows) if (r.value) out[r.key] = r.value;
  return out;
});

export const getPage = cache(async (slug: string): Promise<Page | null> => {
  const { db } = await ctx();
  const { rows } = await db.query('select slug, name, path, seo_title, seo_description, og_image from public.pages where slug = $1', [slug]);
  return (rows[0] as Page) ?? null;
});

export const getSections = cache(async (slug: string) =>
  list<Section>('page_sections', { where: 'page_slug = $1', params: [slug] }));

export const getHero = cache(async (slug: string) =>
  list<HeroSlide>('hero_slides', { where: 'page_slug = $1', params: [slug], windowed: true }));

export const getVehicleCategories = cache(async () => list<VehicleCategory>('vehicle_categories'));

export const getVehicles = cache(async () => list<Vehicle>('vehicles'));

export const getGrades = cache(async () => list<VehicleGrade>('vehicle_grades', { order: 'vehicle_id, sort_order' }));

export const getFaqs = cache(async (group: string) =>
  list<Faq>('faqs', { where: 'group_key = $1', params: [group] }));

/** แคมเปญเปิดตัวที่ใช้งานอยู่ (อันแรกตามลำดับ) */
export const getCampaign = cache(async (): Promise<Campaign | null> => {
  const base = (await list<Campaign>('campaigns'))[0] ?? null;
  if (!base) return null;
  // ทีมงานกำลังทดสอบลิงก์ไลฟ์ (หลังบ้าน → ทดสอบลิงก์ไลฟ์) เห็นเฉพาะคนที่อยู่ในโหมดพรีวิว
  const t = await getLiveTest();
  const c: Campaign = !t ? base : {
    ...base,
    mode: t.phase,
    live_url: t.url && t.phase === 'live' ? t.url : base.live_url,
    replay_url: t.url && t.phase === 'ended' ? t.url : base.replay_url,
    teaser_url: t.url && t.phase === 'upcoming' ? t.url : base.teaser_url,
  };
  // ลิงก์แชร์ของ Facebook (share/v/…) → ลิงก์วิดีโอจริงที่ฝังได้
  const [live_url, replay_url, teaser_url] = await Promise.all([resolveVideoUrl(c.live_url), resolveVideoUrl(c.replay_url), resolveVideoUrl(c.teaser_url)]);
  return { ...c, live_url, replay_url, teaser_url };
});

/** สถานะไลฟ์: auto = คำนวณจากเวลาเริ่ม + จำนวนชั่วโมงไลฟ์ */
export function campaignPhase(c: Campaign, now = Date.now()): 'upcoming' | 'live' | 'ended' {
  if (c.mode !== 'auto') return c.mode;
  if (!c.launch_at) return 'upcoming';
  const start = new Date(c.launch_at).getTime();
  if (now < start) return 'upcoming';
  return now < start + c.live_hours * 3600_000 ? 'live' : 'ended';
}

export const getVehicle = cache(async (slug: string) =>
  (await list<Vehicle>('vehicles', { where: 'slug = $1', params: [slug] }))[0] ?? null);

export const getBodyTypes = cache(async () => list<NamedImageItem>('body_types'));

export const getIndustries = cache(async () => list<Industry>('industries'));

export const getHighlights = cache(async (): Promise<Record<string, Highlight[]>> => {
  const rows = await list<Highlight>('highlights', { order: 'group_key, sort_order, created_at' });
  const out: Record<string, Highlight[]> = {};
  for (const r of rows) (out[r.group_key] ??= []).push(r);
  return out;
});

export const getPromotionCategories = cache(async () => list<PromotionCategory>('promotion_categories'));

export const getPromotions = cache(async () => list<Promotion>('promotions', { windowed: true }));

export const getServices = cache(async () => list<Service>('services'));

export const getBranches = cache(async () => list<Branch>('branches'));

export const getGallery = cache(async (prefix: string) =>
  list<GalleryImage>('gallery_images', { where: 'group_key like $1', params: [`${prefix}%`], order: 'group_key, sort_order, created_at' }).catch(() => [] as GalleryImage[]));

export const getCommunities = cache(async () => list<Community>('communities').catch(() => [] as Community[]));
export const getCommunityPosts = cache(async (communityId?: string) =>
  list<CommunityPost>('community_posts', communityId
    ? { where: 'community_id = $1', params: [communityId], order: 'post_date desc nulls last, sort_order, created_at desc' }
    : { order: 'post_date desc nulls last, sort_order, created_at desc' }).catch(() => [] as CommunityPost[]));

export const getAreas = cache(async () => list<Area>('areas'));

export const getStaff = cache(async () => list<Staff>('staff', { order: 'sort_order, full_name' }));

export const getActivities = cache(async () =>
  list<Activity>('activities', { order: 'sort_order, event_date desc nulls last, created_at' }));

export const getTimeline = cache(async () => list<TimelineEvent>('timeline_events', { order: 'year, sort_order' }));

/** แปลงรายการ section เป็น map ตาม key (เฉพาะที่เปิดแสดง ตามลำดับที่ตั้งไว้) */
export function sectionMap(sections: Section[]) {
  const map: Record<string, Section> = {};
  for (const s of sections) map[s.section_key] = s;
  return map;
}
