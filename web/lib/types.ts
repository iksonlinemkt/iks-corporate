export type Status = 'sample' | 'draft' | 'published';

export interface Page {
  slug: string;
  name: string;
  path: string;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
}

export interface Section {
  id: string;
  page_slug: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image: string | null;
  video_url?: string | null;
  data: Record<string, unknown>;
  status: Status;
}

export interface HeroSlide {
  id: string;
  page_slug: string;
  eyebrow: string | null;
  title: string;
  highlight: string | null;
  subtitle: string | null;
  body: string | null;
  image_desktop: string | null;
  image_mobile: string | null;
  image_alt: string | null;
  cta1_label: string | null;
  cta1_url: string | null;
  cta2_label: string | null;
  cta2_url: string | null;
  status: Status;
}

export interface VehicleCategory {
  id: string;
  slug: string;
  segment: 'pickup' | 'ppv' | 'passenger' | 'commercial';
  name: string;
  subtitle: string | null;
  icon: string | null;
  image: string | null;
  status: Status;
}

export interface Vehicle {
  id: string;
  slug: string;
  category_id: string | null;
  series: string | null;
  name: string;
  tagline: string | null;
  description: string | null;
  price_from: number | null;
  price_note: string | null;
  capacity_label: string | null;
  badge: string | null;
  image_card: string | null;
  image_cutout: string | null;
  colors: { name: string; hex: string }[];
  specs: Record<string, string>;
  gallery: string[];
  is_featured: boolean;
  status: Status;
}

export interface VehicleGrade {
  id: string;
  vehicle_id: string;
  name: string;
  price: number | null;
  engine: string | null;
  power: string | null;
  torque: string | null;
  transmission: string | null;
  drive: string | null;
  wheels: string | null;
  screen: string | null;
  features: string | null;
}

export interface Campaign {
  id: string;
  slug: string;
  nav_label: string;
  show_in_nav: boolean;
  show_on_home?: boolean;
  eyebrow: string | null;
  title: string;
  highlight: string | null;
  body: string | null;
  date_text: string | null;
  launch_at: string | null;
  live_hours: number;
  mode: 'auto' | 'upcoming' | 'live' | 'ended';
  teaser_url: string | null;
  live_url: string | null;
  replay_url: string | null;
  image_desktop: string | null;
  image_mobile: string | null;
  video_poster?: string | null;
  points: string[];
  offer_title: string | null;
  offer_body: string | null;
  form_title: string | null;
}

export interface Faq {
  id: string;
  group_key: string;
  question: string;
  answer: string;
}

export interface Industry extends NamedImageItem {
  gallery: string[];
  slug?: string | null;
  headline?: string | null;
  description?: string | null;
  models_text?: string | null;
}

export interface NamedImageItem {
  id: string;
  name: string;
  name_en?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image: string | null;
  url?: string | null;
  status: Status;
}

export interface Highlight {
  id: string;
  group_key: string;
  icon: string | null;
  title: string;
  subtitle: string | null;
  url: string | null;
  image: string | null;
  status: Status;
}

export interface PromotionCategory {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  icon: string | null;
}

export interface Promotion {
  id: string;
  slug: string;
  category_id: string | null;
  vehicle_id: string | null;
  title: string;
  subtitle: string | null;
  badge: string | null;
  value_label: string | null;
  value_text: string | null;
  bullets: string[];
  terms: string | null;
  image: string | null;
  is_featured: boolean;
  starts_at: string | null;
  ends_at: string | null;
  status: Status;
}

export interface Service {
  id: string;
  group_key: 'general' | 'commercial';
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string | null;
  image: string | null;
  cta_label: string | null;
  cta_url: string | null;
  is_quick_link: boolean;
  status: Status;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string | null;
  district: string | null;
  province: string | null;
  postcode?: string | null;
  phone: string | null;
  line_id: string | null;
  line_url: string | null;
  map_url: string | null;
  google_place_id: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  has_showroom: boolean;
  has_service: boolean;
  has_parts: boolean;
  hours_showroom: string | null;
  hours_service: string | null;
  hours_parts: string | null;
  is_headquarters: boolean;
  nearby?: string | null;
  status: Status;
}

export interface Staff {
  id: string;
  branch_id: string | null;
  full_name: string;
  nickname: string | null;
  position: string | null;
  phone: string | null;
  line_id: string | null;
  photo: string | null;
  status?: Status;
}

export interface Activity {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  cover_image: string | null;
  body?: string | null;
  gallery?: string[];
  video_url?: string | null;
  event_date: string | null;
  status: Status;
}

export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string | null;
  image: string | null;
  status: Status;
}

export type Settings = Record<string, string>;

export interface Area {
  id: string;
  slug: string;
  name: string;
  headline: string | null;
  intro: string | null;
  districts: string | null;
  branch_codes: string | null;
  status: Status;
}

export interface GalleryImage {
  id: string;
  group_key: string;
  image: string;
  thumb: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_image: string | null;
  logo: string | null;
  gallery: string[];
  join_label: string | null;
  join_url: string | null;
  updated_at?: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  title: string;
  body: string | null;
  images: string[];
  video_url: string | null;
  post_date: string | null;
  created_at: string;
}
