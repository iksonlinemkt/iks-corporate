import { permanentRedirect } from 'next/navigation';

/** หน้า "บริการ" เดิม: ย้ายเนื้อหาไปอยู่หน้า "ติดต่อเรา" แล้ว (ลิงก์เก่ายังใช้ได้) */
export default function ServicePage() {
  permanentRedirect('/contact#booking');
}
