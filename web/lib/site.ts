/**
 * โดเมนหลักของเว็บ (ใช้ทำลิงก์ใน sitemap, schema, canonical)
 * ตั้งค่าที่เซิร์ฟเวอร์: /root/iks-web/site_url  เช่น https://www.isuzukrungthep.com
 */
export const SITE_URL = (process.env.SITE_URL || 'https://ikssa.io').trim().replace(/\/+$/, '');
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');
