const styles: Record<string, string> = {
  HOT: "bg-red-50 text-red-600 border border-red-200",
  WARM: "bg-orange-50 text-orange-600 border border-orange-200",
  COLD: "bg-blue-50 text-blue-500 border border-blue-200",
  NONE: "bg-gray-100 text-gray-500 border border-gray-200",
  IKS_CUSTOMER: "bg-green-50 text-green-700 border border-green-200",
  NON_IKS_CUSTOMER: "bg-orange-50 text-orange-600 border border-orange-200",
  PENDING_VERIFICATION: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  IKS_PURCHASE: "bg-iks-navy/10 text-iks-navy border border-iks-navy/30",
  NON_IKS_PURCHASE: "bg-gray-100 text-gray-500 border border-gray-200",
  UNKNOWN: "bg-gray-50 text-gray-400 border border-gray-200",
  พร้อมใช้งาน: "bg-green-50 text-green-700 border border-green-200",
  เข้าศูนย์อยู่: "bg-orange-50 text-orange-600 border border-orange-200",
  ไม่ใช้งาน: "bg-gray-100 text-gray-500 border border-gray-200",
  เสร็จสิ้น: "bg-green-50 text-green-700 border border-green-200",
  กำลังดำเนินการ: "bg-blue-50 text-blue-600 border border-blue-200",
  รอดำเนินการ: "bg-orange-50 text-orange-600 border border-orange-200",
  สูง: "bg-red-50 text-red-600 border border-red-200",
  ปานกลาง: "bg-orange-50 text-orange-600 border border-orange-200",
  ต่ำ: "bg-gray-100 text-gray-500 border border-gray-200",
};

const labels: Record<string, string> = {
  HOT: "HOT",
  WARM: "WARM",
  COLD: "COLD",
  NONE: "-",
  IKS_CUSTOMER: "ซื้อกับ IKS",
  NON_IKS_CUSTOMER: "ไม่พบข้อมูลซื้อ",
  PENDING_VERIFICATION: "รอตรวจสอบ",
  IKS_PURCHASE: "ซื้อกับ IKS",
  NON_IKS_PURCHASE: "ซื้อที่อื่น",
  UNKNOWN: "ไม่ทราบแหล่งซื้อ",
};

export default function Badge({ value, small = false }: { value: string; small?: boolean }) {
  const cls = styles[value] || "bg-gray-100 text-gray-600 border border-gray-200";
  const label = labels[value] || value;
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${cls} ${
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
      }`}
    >
      {label}
    </span>
  );
}
