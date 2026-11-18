import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  // ช่วงก่อนเปิดเว็บ ไม่ให้ Google เก็บหน้า
  if ((process.env.SITE_MODE ?? 'prelaunch') !== 'live') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  // เปิดให้ Google, Bing และ AI search (ChatGPT, Gemini, Perplexity, Claude) อ่านเว็บได้ชัดเจน
  const AI_BOTS = ['Googlebot', 'Bingbot', 'Google-Extended', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'Applebot', 'Applebot-Extended'];
  return {
    rules: [
      { userAgent: AI_BOTS, allow: '/', disallow: ['/preview', '/admin'] },
      { userAgent: '*', allow: '/', disallow: ['/preview', '/admin'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
