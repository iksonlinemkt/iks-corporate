import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
      <Link href="/dashboard" className="hover:text-iks-navy">
        <Home size={14} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={13} className="text-gray-300" />
          {item.href ? (
            <Link href={item.href} className="hover:text-iks-navy">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
