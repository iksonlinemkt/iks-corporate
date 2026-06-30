import {
  Company,
  Vehicle,
  ServiceRecord,
  VisitLog,
  FollowUpTask,
  User,
} from "./types";

export const currentUser: User = {
  id: "u1",
  name: "วรทัศน์ สุวรรณกุล",
  role: "Sales",
  branch: "บางเสาธง",
  avatarColor: "bg-iks-copper",
};

export const branches = [
  { code: "BS", name: "บางเสาธง" },
  { code: "SR", name: "ศรีนครินทร์" },
  { code: "BN", name: "บางนา" },
  { code: "KS", name: "เกษตร" },
  { code: "FT", name: "Fleet Team / HO" },
];

const companyNames = [
  "บริษัท ไทยทรานสปอร์ต จำกัด",
  "บริษัท สยามโลจิสติกส์ จำกัด",
  "บริษัท พี.เอส. ขัพพลายเชน จำกัด",
  "บริษัท เจริญกิจขนส่ง จำกัด",
  "บริษัท นครชัยขนส่ง จำกัด",
  "บริษัท เอ็น.ที. โลจิสติกส์ จำกัด",
  "บริษัท สหชัยวัสภุณฑ์ จำกัด",
  "บริษัท ไพศาลขนส่ง จำกัด",
  "บริษัท ธนกิจ โลจิสติกส์ จำกัด",
  "บริษัท ทรัพย์ไพศาลขนส่ง จำกัด",
  "บริษัท โลจิทรานสปอร์ต จำกัด",
  "บริษัท เอ็มเค โลจิสติกส์ จำกัด",
  "บริษัท สยามทรัพย์ โลจิสติกส์ จำกัด",
  "บริษัท กรุงเทพขนส่ง จำกัด",
  "บริษัท อีสเทิร์น โลจิสติกส์ จำกัด",
];

const salesOwners = ["วรทัศน์ สุวรรณกุล", "นภัสสร ศรีวงษ์", "กิตติพงษ์ จันทร์ดี", "กฤตภาส ศรีสมบัติ", "ชนิษฐา จันทร์เพ็ญ"];
const serviceAdvisors = ["กฤตภาส ศรีสมบัติ", "ปริญญา ทองดี", "ณัฐวุฒิ คงมั่น"];
const serviceCenters = ["ไอเคเอส สาขาบางนา", "ไอเคเอส สาขาบางเสาธง", "ไอเคเอส สาขาศรีนครินทร์", "ไอเคเอส สาขาเกษตร"];
const serviceTypes = ["เช็กระยะ", "ซ่อมทั่วไป", "เปลี่ยนอะไหล่", "งานเคลม", "งานยาง", "งานแบตเตอรี่", "งานตัวถังและสี"];

const pickupSubtypes = ["STD", "SPC NR", "SPC HR", "Cab4 NR", "Cab4 HR"] as const;
const modelPool = [
  { name: "ISUZU D-MAX", group: "P-UP" as const },
  { name: "ISUZU MU-X", group: "MU-X" as const },
  { name: "ISUZU FTR 240", group: "รถบรรทุก" as const },
  { name: "ISUZU FXZ 360", group: "รถบรรทุก" as const },
  { name: "ISUZU NLR 130", group: "รถบรรทุก" as const },
  { name: "ISUZU NPR 150", group: "รถบรรทุก" as const },
  { name: "ISUZU FVM 300", group: "รถบรรทุก" as const },
  { name: "HINO VICTOR 500", group: "อื่นๆ" as const },
  { name: "HINO DOMINATOR", group: "อื่นๆ" as const },
];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
const rand = seedRandom(42);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pad = (n: number, len = 4) => n.toString().padStart(len, "0");

function thDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

export const companies: Company[] = companyNames.map((name, i) => {
  const purchaseStatus = i % 3 === 0 ? "NON_IKS_CUSTOMER" : i % 5 === 0 ? "PENDING_VERIFICATION" : "IKS_CUSTOMER";
  return {
    id: `C${pad(i + 1)}`,
    name,
    taxId: `01${randInt(10, 99)}55${randInt(100000, 999999)}`,
    businessType: pick(["ขนส่งสินค้าและโลจิสติกส์", "ก่อสร้าง", "เกษตรอุตสาหกรรม", "ค้าปลีก-ค้าส่ง", "ผลิตและจัดจำหน่าย"]),
    address: `${randInt(1, 199)}/${randInt(1, 9)} หมู่ ${randInt(1, 12)} ถ.สุขุมวิท ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ ${randInt(10000, 10999)}`,
    province: pick(["สมุทรปราการ", "กรุงเทพมหานคร", "ชลบุรี", "ปทุมธานี", "ฉะเชิงเทรา"]),
    branch: pick(branches.map((b) => b.name)),
    iksPurchaseStatus: purchaseStatus,
    salesOwner: pick(salesOwners),
    opportunityLevel: pick(["HOT", "WARM", "COLD", "NONE"]),
    customerSince: thDate(randInt(200, 2200)),
    customerGroup: pick(["Strategic", "Standard", "Fleet VIP"]),
  };
});

export const vehicles: Vehicle[] = [];
companies.forEach((c) => {
  const count = randInt(2, 18);
  for (let i = 0; i < count; i++) {
    const model = pick(modelPool);
    const isIks = c.iksPurchaseStatus === "IKS_CUSTOMER" ? rand() > 0.25 : rand() > 0.75;
    vehicles.push({
      id: `V${c.id}-${pad(i + 1, 2)}`,
      companyId: c.id,
      registrationNumber: `${randInt(70, 89)}-${randInt(1000, 9999)}`,
      registrationProvince: c.province,
      engineNumber: `${pick(["4JJ1", "6HK1", "4HK1", "FL8J"])}-${randInt(100000, 999999)}`,
      chassisNumber: `MP1${pick(["FVZ34", "FTR34", "NLR85", "FVM34"])}${pick(["K", "J", "L"])}PT${randInt(100000, 999999)}`,
      vehicleModel: model.name,
      vehicleGroup: model.group,
      vehicleSubtype: model.group === "P-UP" ? pick(pickupSubtypes) : "-",
      vehicleYear: randInt(2561, 2567),
      purchaseYear: randInt(2561, 2567),
      purchaseDate: thDate(randInt(100, 2000)),
      ownershipStatus: isIks ? "IKS_PURCHASE" : rand() > 0.5 ? "NON_IKS_PURCHASE" : "UNKNOWN",
      vehicleStatus: rand() > 0.92 ? "เข้าศูนย์อยู่" : rand() > 0.97 ? "ไม่ใช้งาน" : "พร้อมใช้งาน",
    });
  }
});

export const serviceRecords: ServiceRecord[] = [];
let roSeq = 1;
vehicles.forEach((v) => {
  const visits = rand() > 0.15 ? randInt(1, 28) : 0;
  for (let i = 0; i < visits; i++) {
    const cost = randInt(1500, 25000);
    const warranty = rand() > 0.7 ? Math.round(cost * 0.3) : 0;
    serviceRecords.push({
      id: `SR${pad(roSeq, 5)}`,
      companyId: v.companyId,
      vehicleId: v.id,
      roNumber: `WS-${randInt(23, 24)}${pad(randInt(1, 12), 2)}${pad(randInt(1, 28), 2)}-${pad(roSeq, 4)}`,
      serviceDate: thDate(randInt(1, 1200)),
      serviceType: pick(serviceTypes),
      serviceDetail: pick([
        "เช็กระยะตามกำหนด เปลี่ยนน้ำมันเครื่อง+กรอง",
        "ซ่อมระบบเบรก เปลี่ยนผ้าเบรกหน้า-หลัง",
        "เปลี่ยนยาง 6 เส้น",
        "เคลมระบบไฟฟ้า ตามเงื่อนไขการรับประกัน",
        "ซ่อมระบบไฟฟ้า",
        "เปลี่ยนแบตเตอรี่",
        "ซ่อมตัวถังและสี",
      ]),
      mileage: randInt(5000, 250000),
      serviceCenter: pick(serviceCenters),
      serviceAdvisor: pick(serviceAdvisors),
      totalCost: cost,
      warrantyCost: warranty,
      customerPaidAmount: cost - warranty,
    });
    roSeq++;
  }
});

const visitResults = ["นัดหมายสำเร็จ", "สนใจรับใบเสนอราคา", "สนใจเปลี่ยนรถ", "รอติดตาม", "ยังไม่พร้อม", "ส่งต่อฝ่ายบริการ", "ปิดโอกาส"];
export const visitLogs: VisitLog[] = [];
let visitSeq = 1;
companies.forEach((c) => {
  const n = randInt(0, 6);
  for (let i = 0; i < n; i++) {
    visitLogs.push({
      id: `VL${pad(visitSeq, 4)}`,
      companyId: c.id,
      visitDate: thDate(randInt(1, 600)),
      visitorName: c.salesOwner,
      attendeeName: pick(["คุณสมชาย ใจดี", "คุณวิภาวี รุ่งเรือง", "คุณประเสริฐ มั่นคง", "คุณนิภา ทองสุข"]),
      attendeePosition: pick(["ผู้จัดการฝ่ายจัดซื้อ", "เจ้าหน้าที่จัดซื้อ", "ผู้จัดการฝ่ายซ่อมบำรุง", "เจ้าของกิจการ"]),
      objective: pick(["แนะนำสินค้า/ติดตามการใช้งาน", "นัดหมายเสนอราคา", "ติดตามการซ่อม", "ต่ออายุสัญญาบริการ", "แนะนำรถรุ่นใหม่"]),
      discussionSummary: pick([
        "ลูกค้าพอใจในการใช้งานรถรุ่นเดิม ต้องการรถเพิ่มบรรทุก 6 ล้อ",
        "ลูกค้าสอบถามแผนการเปลี่ยนรถรุ่นใหม่ในปีหน้า",
        "ลูกค้าแจ้งปัญหาการเข้าศูนย์ล่าช้า ขอให้ติดตามดูแลเพิ่มเติม",
      ]),
      visitResult: pick(visitResults),
      opportunityLevel: pick(["HOT", "WARM", "COLD", "NONE"]),
      nextAction: pick(["จัดทำใบเสนอราคาและเปรียบเทียบต้นทุนการใช้งาน", "ติดตามผลการพิจารณา", "นัดหมายทดลองขับ", "ส่งโปรแกรมบริการหลังการขาย"]),
      nextFollowupDate: thDate(-randInt(1, 60)),
    });
    visitSeq++;
  }
});

const taskTitles = ["ติดตามใบเสนอราคา", "นัดหมายเข้าเยี่ยม", "ติดตามเคลมยางใหม่", "ติดตามการชำระเงิน", "ตรวจเช็กรถก่อนส่งมอบ", "แนะนำโปรแกรมเช่าซื้อ"];
export const followUpTasks: FollowUpTask[] = [];
let taskSeq = 1;
companies.forEach((c) => {
  if (rand() > 0.55) {
    followUpTasks.push({
      id: `FT${pad(taskSeq, 4)}`,
      companyId: c.id,
      taskTitle: pick(taskTitles),
      assignedTo: c.salesOwner,
      dueDate: thDate(-randInt(1, 30)),
      priority: pick(["สูง", "ปานกลาง", "ต่ำ"]),
      status: pick(["รอดำเนินการ", "กำลังดำเนินการ", "เสร็จสิ้น"]),
    });
    taskSeq++;
  }
});

// ---------- Aggregation helpers ----------
export function getCompanyVehicles(companyId: string) {
  return vehicles.filter((v) => v.companyId === companyId);
}
export function getCompanyServiceRecords(companyId: string) {
  return serviceRecords.filter((s) => s.companyId === companyId);
}
export function getVehicleServiceRecords(vehicleId: string) {
  return serviceRecords.filter((s) => s.vehicleId === vehicleId).sort((a, b) => (a.serviceDate < b.serviceDate ? 1 : -1));
}
export function getCompanyVisits(companyId: string) {
  return visitLogs.filter((v) => v.companyId === companyId);
}
export function getCompanyTasks(companyId: string) {
  return followUpTasks.filter((t) => t.companyId === companyId);
}

export function companySummary(companyId: string) {
  const vs = getCompanyVehicles(companyId);
  const srs = getCompanyServiceRecords(companyId);
  const iksVehicles = vs.filter((v) => v.ownershipStatus === "IKS_PURCHASE");
  const roSet = new Set(srs.map((s) => s.roNumber));
  const totalCost = srs.reduce((sum, s) => sum + s.totalCost, 0);
  const vehiclesWithService = new Set(srs.map((s) => s.vehicleId));
  const lastVisit = getCompanyVisits(companyId).sort((a, b) => (a.visitDate < b.visitDate ? 1 : -1))[0];
  const nextTask = getCompanyTasks(companyId)
    .filter((t) => t.status !== "เสร็จสิ้น")
    .sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1))[0];
  return {
    totalVehicles: vs.length,
    iksVehicles: iksVehicles.length,
    nonIksVehicles: vs.filter((v) => v.ownershipStatus === "NON_IKS_PURCHASE").length,
    unknownVehicles: vs.filter((v) => v.ownershipStatus === "UNKNOWN").length,
    vehiclesServiced: vehiclesWithService.size,
    totalServiceCount: roSet.size,
    totalServiceCost: totalCost,
    lastVisitDate: lastVisit?.visitDate,
    nextTaskDate: nextTask?.dueDate,
  };
}

export function vehicleSummary(vehicleId: string) {
  const srs = getVehicleServiceRecords(vehicleId);
  const roSet = new Set(srs.map((s) => s.roNumber));
  const totalCost = srs.reduce((sum, s) => sum + s.totalCost, 0);
  const last = srs[0];
  const typeCounts: Record<string, number> = {};
  srs.forEach((s) => (typeCounts[s.serviceType] = (typeCounts[s.serviceType] || 0) + 1));
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return {
    serviceCount: roSet.size,
    totalCost,
    lastServiceDate: last?.serviceDate,
    lastServiceCost: last?.totalCost,
    topServiceType: topType,
    lastMileage: last?.mileage,
  };
}

export function getCompanyById(id: string) {
  return companies.find((c) => c.id === id);
}
export function getVehicleById(id: string) {
  return vehicles.find((v) => v.id === id);
}

export function formatBaht(n: number) {
  return new Intl.NumberFormat("th-TH").format(n);
}
