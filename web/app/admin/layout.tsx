import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'หลังบ้าน | IKS', template: '%s | หลังบ้าน IKS' },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-mist text-navy">{children}</div>;
}
