import type { MetadataRoute } from 'next';
import { publicDb } from '@/lib/db';
import { SITE_URL } from '@/lib/site';
import { branchPath } from '@/lib/branch';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const pages = ['/', '/models', '/commercial', '/promotions', '/activities', '/happy-whale', '/about', '/contact', '/test-drive', '/live', '/my-member', '/why', '/biturbo', '/community'];
  let models: { slug: string; updated_at: Date }[] = [];
  let branches: { code: string; updated_at: Date }[] = [];
  let upfits: { slug: string; updated_at: Date }[] = [];
  let areas: { slug: string; updated_at: Date }[] = [];
  let clubs: { slug: string; updated_at: Date }[] = [];
  try {
    models = (await publicDb().query('select slug, updated_at from public.published_vehicles')).rows;
    branches = (await publicDb().query('select code, updated_at from public.published_branches')).rows;
    upfits = (await publicDb().query("select slug, updated_at from public.published_industries where slug is not null and coalesce(description, '') <> ''")).rows;
    areas = (await publicDb().query('select slug, updated_at from public.published_areas')).rows;
    clubs = (await publicDb().query('select slug, updated_at from public.published_communities')).rows;
  } catch {
    /* ฐานข้อมูลไม่พร้อม: ส่งเฉพาะหน้าหลัก */
  }
  return [
    ...pages.map((p) => ({ url: base + p, changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.7 })),
    ...models.map((m) => ({ url: `${base}/models/${m.slug}`, lastModified: m.updated_at, priority: 0.6 })),
    ...branches.map((b) => ({ url: `${base}${branchPath(b)}`, lastModified: b.updated_at, priority: 0.8 })),
    ...upfits.map((u) => ({ url: `${base}/commercial/${u.slug}`, lastModified: u.updated_at, priority: 0.8 })),
    ...areas.map((a) => ({ url: `${base}/areas/${a.slug}`, lastModified: a.updated_at, priority: 0.8 })),
    ...clubs.map((c) => ({ url: `${base}/community/${c.slug}`, lastModified: c.updated_at, priority: 0.6 })),
  ];
}
