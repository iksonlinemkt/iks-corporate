export const NAV = [
  { href: '/', label: 'หน้าหลัก' },
  { href: '/models', label: 'รุ่นรถ' },
  { href: '/commercial', label: 'รถเพื่อการพาณิชย์' },
  { href: '/promotions', label: 'โปรโมชั่น' },
  { href: '/activities', label: 'กิจกรรม' },
  { href: '/my-member', label: 'my-MEMBER' },
  { href: '/community', label: 'Community' },
  { href: '/happy-whale', label: 'Happy Whale' },
  { href: '/about', label: 'เกี่ยวกับเรา' },
  { href: '/contact', label: 'ติดต่อเรา' },
];

export function Wordmark({ light = false, className = 'h-11 lg:h-12' }: { light?: boolean; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={light ? '/brand/iks-logo-white.png' : '/brand/iks-logo.png'}
      alt="IKS อีซูซุกรุงเทพเซลส์"
      width={290}
      height={118}
      className={`w-auto ${className}`}
    />
  );
}
