import {
  Banknote, Briefcase, Bus, CalendarDays, Car, CarFront, Check, ClipboardCheck, Construction, Container,
  Hammer, Handshake, Headset, Heart, Leaf, LifeBuoy, MapPin, MessageCircle, Package, Phone, Settings,
  Shield, Sparkles, Star, Tag, Tractor, Trophy, Truck, User, UserCheck, Users, Wrench, type LucideIcon,
} from 'lucide-react';

/** ชื่อไอคอนที่หลังบ้านเลือกได้ (เก็บในคอลัมน์ icon) */
const ICONS: Record<string, LucideIcon> = {
  pickup: CarFront,
  suv: Car,
  car: CarFront,
  truck: Truck,
  'dump-truck': Container,
  tractor: Tractor,
  bus: Bus,
  crane: Construction,
  tag: Tag,
  wrench: Wrench,
  'map-pin': MapPin,
  'user-check': UserCheck,
  banknote: Banknote,
  check: Check,
  trophy: Trophy,
  settings: Settings,
  headset: Headset,
  handshake: Handshake,
  heart: Heart,
  users: Users,
  shield: Shield,
  leaf: Leaf,
  star: Star,
  user: User,
  phone: Phone,
  message: MessageCircle,
  sparkles: Sparkles,
  calendar: CalendarDays,
  package: Package,
  sos: LifeBuoy,
  clipboard: ClipboardCheck,
  hammer: Hammer,
  briefcase: Briefcase,
};

export function Icon({ name, className, size = 22 }: { name: string | null | undefined; className?: string; size?: number }) {
  const C = (name && ICONS[name]) || Check;
  return <C className={className} size={size} strokeWidth={1.75} aria-hidden />;
}
