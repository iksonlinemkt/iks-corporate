import '@fontsource/bai-jamjuree/thai-600.css';
import '@fontsource/bai-jamjuree/thai-700.css';
import '@fontsource/bai-jamjuree/latin-600.css';
import '@fontsource/bai-jamjuree/latin-700.css';
import '@fontsource/ibm-plex-sans-thai/thai-400.css';
import '@fontsource/ibm-plex-sans-thai/thai-500.css';
import '@fontsource/ibm-plex-sans-thai/thai-600.css';
import '@fontsource/ibm-plex-sans-thai/latin-400.css';
import '@fontsource/ibm-plex-sans-thai/latin-500.css';
import '@fontsource/ibm-plex-sans-thai/latin-600.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'อีซูซุกรุงเทพเซลส์ ตัวแทนจำหน่ายรถอีซูซุ กรุงเทพฯ', template: '%s' },
  description: 'อีซูซุกรุงเทพเซลส์ ตัวแทนจำหน่ายรถอีซูซุ ตั้งแต่ พ.ศ. 2525 · 4 สาขาในกรุงเทพฯ · D-MAX, MU-X และกระบะต่อตู้เพื่อการพาณิชย์ พร้อมศูนย์บริการ',
};

export const viewport: Viewport = {
  themeColor: '#061630',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
