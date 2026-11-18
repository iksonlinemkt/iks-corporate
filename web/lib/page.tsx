import 'server-only';
import { Fragment } from 'react';
import type { Metadata } from 'next';
import { getPage } from './content';
import { mediaUrl } from './format';
import type { Section } from './types';

export async function pageMetadata(slug: string): Promise<Metadata> {
  const p = await getPage(slug);
  if (!p) return {};
  const og = mediaUrl(p.og_image);
  return {
    title: p.seo_title ?? p.name,
    description: p.seo_description ?? undefined,
    alternates: { canonical: p.path },
    openGraph: {
      title: p.seo_title ?? p.name,
      description: p.seo_description ?? undefined,
      url: p.path,
      siteName: 'อีซูซุกรุงเทพเซลส์',
      locale: 'th_TH',
      type: 'website',
      images: og ? [og] : undefined,
    },
  };
}

/**
 * แสดง section ตามลำดับและการเปิด/ปิดที่ตั้งไว้ในหลังบ้าน (ตาราง page_sections)
 * key ที่ไม่มีตัวแสดงผล จะถูกข้ามไป
 */
export function Sections({
  list, render,
}: {
  list: Section[];
  render: Record<string, (s: Section) => React.ReactNode>;
}) {
  return (
    <>
      {list.map((s) => {
        const r = render[s.section_key];
        return r ? <Fragment key={s.id}>{r(s)}</Fragment> : null;
      })}
    </>
  );
}
