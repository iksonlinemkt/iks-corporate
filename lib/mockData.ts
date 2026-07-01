import { Company, Vehicle, ServiceRecord, VisitLog, FollowUpTask, User, Executive } from "./types";

export const currentUser: User = {
  id: "u1", name: "วรทัศน์ สุวรรณกุล", role: "Sales", branch: "บางเสาธง", avatarColor: "bg-iks-copper",
};

export const branches = [
  { code: "BS", name: "บางเสาธง" }, { code: "SR", name: "ศรีนครินทร์" },
  { code: "BN", name: "บางนา" }, { code: "KS", name: "เกษตร" }, { code: "FT", name: "Fleet Team / HO" },
];

function seedRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const rand = seedRandom(42);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pad = (n: number, len = 4) => n.toString().padStart(len, "0");

function isoDateDaysAgo(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}
function thDateFromISO(iso: string) {
  const d = new Date(iso);
  const months = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}
function thDate(daysAgo: number) { return thDateFromISO(isoDateDaysAgo(daysAgo)); }

const salesOwners = ["วรทัศน์ สุวรรณกุล","นภัสสร ศรีวงษ์","กิตติพงษ์ จันทร์ดี","กฤตภาส ศรีสมบัติ","ชนิษฐา จันทร์เพ็ญ"];
const serviceAdvisors = ["กฤตภาส ศรีสมบัติ","ปริญญา ทองดี","ณัฐวุฒิ คงมั่น"];
const serviceCenters = ["ไอเคเอส สาขาบางนา","ไอเคเอส สาขาบางเสาธง","ไอเคเอส สาขาศรีนครินทร์","ไอเคเอส สาขาเกษตร"];
const serviceTypes = ["เช็กระยะ","ซ่อมทั่วไป","เปลี่ยนอะไหล่","งานเคลม","งานยาง","งานแบตเตอรี่","งานตัวถังและสี"];
const pickupSubtypes = ["STD","SPC NR","SPC HR","Cab4 NR","Cab4 HR"] as const;
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
const driverNames = ["นายสมชาย ใจดี","นายวิชัย พันธุ์ดี","นายประเสริฐ มั่นคง","นางสาวนิภา ทองสุข","นายสุรชัย รักดี","นายอนันต์ สวัสดี"];

const companyData: Partial<Company>[] = [
  { name:"บริษัท ไทยทรานสปอร์ต จำกัด", businessType:"ขนส่งสินค้าและโลจิสติกส์", taxId:"0105558123456",
    truckCount:18, sedanCount:2, pickupCount:5, otherBrand:"Hino",
    routeDescription:"กรุงเทพฯ - ชลบุรี - ระยอง", replacementCycle:"ทุก 5 ปี",
    purchaseCondition:"เช่าซื้อ", vehicleNeedCount:3, vehicleNeedPeriod:"ไตรมาส 3 ปีนี้",
    preferredServiceCenter:"ไอเคเอส สาขาบางนา", serviceFrequency:"ทุก 45 วัน / คัน",
    oilBrand:"Isuzu Genuine Oil", tyreBrand:"Bridgestone",
    hotInterest:"FXZ 360 หัวลาก, NPR 150 กระบะ 4 ล้อ",
    painPoint:"ค่าซ่อมสูง เน้นเช็กระยะตรงเวลา", bringToService:12,
    customerGrade:"A", clubMember:"Isuzu Excellence Club", internalNote:"ลูกค้า VIP ดูแลอย่างใกล้ชิด" },
  { name:"บริษัท สยามโลจิสติกส์ จำกัด", businessType:"โลจิสติกส์และจัดเก็บสินค้า", taxId:"0107557234567",
    truckCount:11, sedanCount:1, pickupCount:3, otherBrand:"Fuso",
    routeDescription:"กรุงเทพฯ - นครราชสีมา - ขอนแก่น",
    replacementCycle:"ทุก 4 ปี", purchaseCondition:"ลีสซิ่ง",
    vehicleNeedCount:2, vehicleNeedPeriod:"ปลายปีนี้",
    preferredServiceCenter:"ไอเคเอส สาขาศรีนครินทร์", bringToService:8,
    customerGrade:"B", hotInterest:"FVM 300 6x4" },
  { name:"บริษัท พี.เอส. ขัพพลายเชน จำกัด", businessType:"ซัพพลายเชนและกระจายสินค้า", taxId:"0109558345678",
    truckCount:7, sedanCount:0, pickupCount:4, otherBrand:"-",
    routeDescription:"กรุงเทพฯ - สมุทรปราการ - ฉะเชิงเทรา",
    replacementCycle:"ทุก 6 ปี", purchaseCondition:"เงินสด", bringToService:6, customerGrade:"A" },
  { name:"บริษัท เจริญกิจขนส่ง จำกัด", businessType:"ขนส่งสินค้าเกษตร", taxId:"0101559456789",
    truckCount:5, pickupCount:0, sedanCount:1, otherBrand:"Isuzu (ที่อื่น)",
    routeDescription:"กรุงเทพฯ - ภาคกลาง", replacementCycle:"ทุก 5 ปี",
    purchaseCondition:"เช่าซื้อ", bringToService:4, customerGrade:"C" },
  { name:"บริษัท นครชัยขนส่ง จำกัด", businessType:"ขนส่งผู้โดยสารและสินค้า", taxId:"0102550567890",
    truckCount:7, pickupCount:2, sedanCount:0, otherBrand:"Hino, Fuso",
    routeDescription:"กรุงเทพฯ - เชียงใหม่ - เชียงราย", bringToService:5, customerGrade:"B" },
  { name:"บริษัท เอ็น.ที. โลจิสติกส์ จำกัด", businessType:"โลจิสติกส์ 3PL", taxId:"0103551678901",
    truckCount:11, pickupCount:1, sedanCount:2, otherBrand:"Hino",
    routeDescription:"ทั่วประเทศ", bringToService:9, customerGrade:"A" },
  { name:"บริษัท สหชัยวัสภุณฑ์ จำกัด", businessType:"วัสดุก่อสร้างและขนส่ง", taxId:"0104552789012",
    truckCount:9, pickupCount:3, sedanCount:1, otherBrand:"-",
    routeDescription:"กรุงเทพฯ - ปริมณฑล", bringToService:7, customerGrade:"B" },
  { name:"บริษัท ไพศาลขนส่ง จำกัด", businessType:"ขนส่งสินค้าอุตสาหกรรม", taxId:"0105553890123",
    truckCount:3, pickupCount:1, sedanCount:0, otherBrand:"Mitsubishi",
    routeDescription:"นิคมอุตสาหกรรมสมุทรปราการ", bringToService:2, customerGrade:"C" },
  { name:"บริษัท ธนกิจ โลจิสติกส์ จำกัด", businessType:"โลจิสติกส์และคลังสินค้า", taxId:"0106554901234",
    truckCount:18, pickupCount:5, sedanCount:2, otherBrand:"Hino, Isuzu (อื่น)",
    routeDescription:"กรุงเทพฯ - ภาคตะวันออก", bringToService:13, customerGrade:"A" },
  { name:"บริษัท ทรัพย์ไพศาลขนส่ง จำกัด", businessType:"ขนส่งสินค้าทั่วไป", taxId:"0107555012345",
    truckCount:12, pickupCount:2, sedanCount:1, otherBrand:"Hino",
    routeDescription:"กรุงเทพฯ - ภาคใต้", bringToService:10, customerGrade:"B" },
  { name:"บริษัท โลจิทรานสปอร์ต จำกัด", businessType:"ขนส่งห้องเย็น", taxId:"0108556123456",
    truckCount:8, pickupCount:0, sedanCount:1, otherBrand:"-",
    routeDescription:"กรุงเทพฯ - ทั่วประเทศ (ห้องเย็น)", bringToService:6, customerGrade:"B" },
  { name:"บริษัท เอ็มเค โลจิสติกส์ จำกัด", businessType:"รับจ้างขนส่งทั่วไป", taxId:"0109557234567",
    truckCount:5, pickupCount:2, sedanCount:1, otherBrand:"Mitsubishi",
    routeDescription:"กรุงเทพฯ - ภาคกลาง", bringToService:4, customerGrade:"C" },
  { name:"บริษัท สยามทรัพย์ โลจิสติกส์ จำกัด", businessType:"โลจิสติกส์ครบวงจร", taxId:"0101558345678",
    truckCount:14, pickupCount:4, sedanCount:2, otherBrand:"Hino",
    routeDescription:"กรุงเทพฯ - AEC", bringToService:11, customerGrade:"A" },
  { name:"บริษัท กรุงเทพขนส่ง จำกัด", businessType:"ขนส่งในเมือง", taxId:"0102559456789",
    truckCount:6, pickupCount:1, sedanCount:0, otherBrand:"-",
    routeDescription:"กรุงเทพฯ และปริมณฑล", bringToService:5, customerGrade:"C" },
  { name:"บริษัท อีสเทิร์น โลจิสติกส์ จำกัด", businessType:"โลจิสติกส์ภาคตะวันออก", taxId:"0103550567890",
    truckCount:9, pickupCount:3, sedanCount:1, otherBrand:"Hino",
    routeDescription:"ชลบุรี - ระยอง - ตราด", bringToService:7, customerGrade:"B" },
];

export const companies: Company[] = companyData.map((d, i) => ({
  ...d,
  id: `C${pad(i + 1)}`,
  address: `${randInt(1,199)}/${randInt(1,9)} หมู่ ${randInt(1,12)} ต.บางพลีใหญ่ อ.บางพลี จ.สมุทรปราการ ${randInt(10000,10999)}`,
  province: pick(["สมุทรปราการ","กรุงเทพมหานคร","ชลบุรี","ปทุมธานี","ฉะเชิงเทรา"]),
  branch: pick(branches.map(b => b.name)),
  salesOwner: pick(salesOwners),
  scName: pick(salesOwners),
  iksPurchaseStatus: i % 3 === 0 ? "NON_IKS_CUSTOMER" : i % 7 === 0 ? "PENDING_VERIFICATION" : "IKS_CUSTOMER",
  opportunityLevel: pick(["HOT","WARM","COLD","NONE"] as const),
  customerSince: thDate(randInt(200,2200)),
  customerGroup: pick(["Strategic","Standard","Fleet VIP"]),
  serviceFrequency: d.serviceFrequency || "ทุก 60 วัน / คัน",
  oilBrand: d.oilBrand || "Isuzu Genuine Oil",
  tyreBrand: d.tyreBrand || pick(["Bridgestone","Michelin","Dunlop"]),
  hotInterest: d.hotInterest || pick(["FXZ 360","D-MAX SPC HR","NLR 130","NPR 150"]),
  painPoint: d.painPoint || pick(["ต้องการรถประหยัดน้ำมัน","บำรุงรักษาต่ำ","ราคาซ่อมสมเหตุสมผล"]),
  preferredServiceCenter: d.preferredServiceCenter || pick(serviceCenters),
  routeDescription: d.routeDescription || "กรุงเทพฯ และปริมณฑล",
  replacementCycle: d.replacementCycle || pick(["ทุก 3 ปี","ทุก 4 ปี","ทุก 5 ปี","ทุก 6 ปี"]),
  purchaseCondition: d.purchaseCondition || pick(["เช่าซื้อ","ลีสซิ่ง","เงินสด"]),
  clubMember: d.clubMember || (rand() > 0.5 ? "Isuzu Excellence Club" : "-"),
  internalNote: d.internalNote || "",
} as Company));

// Executives
const execNames = [["สมชาย ใจดี","กรรมการผู้จัดการ","081-234-5678","@somchai","somchai@co.th","15 มกราคม 2510","กอล์ฟ, ตกปลา"],
  ["วิภาวี รุ่งเรือง","ผู้จัดการฝ่ายจัดซื้อ","092-345-6789","@wipavee","wipavee@co.th","22 มีนาคม 2520","วิ่ง, ท่องเที่ยว"],
  ["ประเสริฐ มั่นคง","ผู้จัดการฝ่ายซ่อมบำรุง","083-456-7890","@prasert","prasert@co.th","8 กรกฎาคม 2515","ฟุตบอล, เพาะกาย"],
  ["นิภา ทองสุข","เจ้าหน้าที่จัดซื้อ","089-567-8901","@nipa","nipa@co.th","30 พฤษภาคม 2530","อ่านหนังสือ, ทำอาหาร"],
  ["สุรชัย รักดี","ผู้ช่วยผู้จัดการ","085-678-9012","@surachai","surachai@co.th","12 ธันวาคม 2518","ดูหนัง, เดินป่า"]];

export const executives: Executive[] = [];
companies.forEach((c) => {
  const count = randInt(2,4);
  for (let i = 0; i < count && i < execNames.length; i++) {
    const [name, pos, phone, line, email, bday, hobby] = execNames[i];
    executives.push({
      id: `E${c.id}-${i+1}`, companyId: c.id,
      name, position: pos, phone, lineId: line, email, birthday: bday, hobby,
      isPrimary: i === 0,
    });
  }
});

export function getCompanyExecutives(companyId: string) {
  return executives.filter(e => e.companyId === companyId);
}

// Vehicles
export const vehicles: Vehicle[] = [];
companies.forEach((c) => {
  const count = randInt(3, 18);
  for (let i = 0; i < count; i++) {
    const model = pick(modelPool);
    const isIks = c.iksPurchaseStatus === "IKS_CUSTOMER" ? rand() > 0.25 : rand() > 0.75;
    vehicles.push({
      id: `V${c.id}-${pad(i+1,2)}`, companyId: c.id,
      registrationNumber: `${randInt(70,89)}-${randInt(1000,9999)}`,
      registrationProvince: c.province,
      engineNumber: `${pick(["4JJ1","6HK1","4HK1","FL8J"])}-${randInt(100000,999999)}`,
      chassisNumber: `MP1${pick(["FVZ34","FTR34","NLR85","FVM34"])}${pick(["K","J","L"])}PT${randInt(100000,999999)}`,
      vehicleModel: model.name, vehicleGroup: model.group,
      vehicleSubtype: model.group === "P-UP" ? pick(pickupSubtypes) : "-",
      vehicleYear: randInt(2561,2567), purchaseYear: randInt(2561,2567),
      purchaseDate: thDate(randInt(100,2000)),
      ownershipStatus: isIks ? "IKS_PURCHASE" : rand() > 0.5 ? "NON_IKS_PURCHASE" : "UNKNOWN",
      vehicleStatus: rand() > 0.92 ? "เข้าศูนย์อยู่" : rand() > 0.97 ? "ไม่ใช้งาน" : "พร้อมใช้งาน",
      driverName: rand() > 0.3 ? pick(driverNames) : undefined,
      driverPhone: rand() > 0.3 ? `08${randInt(1,9)}-${randInt(100,999)}-${randInt(1000,9999)}` : undefined,
    });
  }
});

// Service Records — with ISO dates for calendar
export const serviceRecords: ServiceRecord[] = [];
let roSeq = 1;
vehicles.forEach((v) => {
  const visits = rand() > 0.15 ? randInt(1,28) : 0;
  for (let i = 0; i < visits; i++) {
    const daysAgo = randInt(1,1200);
    const iso = isoDateDaysAgo(daysAgo);
    const cost = randInt(1500,25000);
    const warranty = rand() > 0.7 ? Math.round(cost * 0.3) : 0;
    serviceRecords.push({
      id: `SR${pad(roSeq,5)}`, companyId: v.companyId, vehicleId: v.id,
      roNumber: `WS-${iso.slice(2,4)}${pad(parseInt(iso.slice(5,7)),2)}${pad(parseInt(iso.slice(8,10)),2)}-${pad(roSeq,4)}`,
      serviceDate: thDateFromISO(iso), serviceDateISO: iso,
      serviceType: pick(serviceTypes),
      serviceDetail: pick(["เช็กระยะตามกำหนด เปลี่ยนน้ำมันเครื่อง+กรอง","ซ่อมระบบเบรก เปลี่ยนผ้าเบรกหน้า-หลัง","เปลี่ยนยาง 6 เส้น","เคลมระบบไฟฟ้าตามประกัน","เปลี่ยนแบตเตอรี่","ซ่อมระบบไฟฟ้า","ซ่อมตัวถังและสี"]),
      mileage: randInt(5000,250000), serviceCenter: pick(serviceCenters),
      serviceAdvisor: pick(serviceAdvisors),
      totalCost: cost, warrantyCost: warranty, customerPaidAmount: cost - warranty,
    });
    roSeq++;
  }
});

const visitResults = ["นัดหมายสำเร็จ","สนใจรับใบเสนอราคา","สนใจเปลี่ยนรถ","รอติดตาม","ยังไม่พร้อม","ส่งต่อฝ่ายบริการ","ปิดโอกาส"];
export const visitLogs: VisitLog[] = [];
let visitSeq = 1;
companies.forEach((c) => {
  const n = randInt(0,6);
  for (let i = 0; i < n; i++) {
    visitLogs.push({
      id: `VL${pad(visitSeq,4)}`, companyId: c.id,
      visitDate: thDate(randInt(1,600)), visitorName: c.salesOwner,
      attendeeName: pick(["คุณสมชาย ใจดี","คุณวิภาวี รุ่งเรือง","คุณประเสริฐ มั่นคง","คุณนิภา ทองสุข"]),
      attendeePosition: pick(["ผู้จัดการฝ่ายจัดซื้อ","เจ้าหน้าที่จัดซื้อ","ผู้จัดการฝ่ายซ่อมบำรุง","เจ้าของกิจการ"]),
      objective: pick(["แนะนำสินค้า/ติดตามการใช้งาน","นัดหมายเสนอราคา","ติดตามการซ่อม","แนะนำรถรุ่นใหม่"]),
      discussionSummary: pick(["ลูกค้าพอใจในการใช้งานรถรุ่นเดิม ต้องการรถเพิ่มบรรทุก 6 ล้อ","ลูกค้าสอบถามแผนการเปลี่ยนรถรุ่นใหม่ในปีหน้า","ลูกค้าแจ้งปัญหาการเข้าศูนย์ล่าช้า"]),
      visitResult: pick(visitResults),
      opportunityLevel: pick(["HOT","WARM","COLD","NONE"] as const),
      nextAction: pick(["จัดทำใบเสนอราคา","ติดตามผลการพิจารณา","นัดหมายทดลองขับ","ส่งโปรแกรมบริการ"]),
      nextFollowupDate: thDate(-randInt(1,60)),
    });
    visitSeq++;
  }
});

export const followUpTasks: FollowUpTask[] = [];
let taskSeq = 1;
const taskTitles = ["ติดตามใบเสนอราคา","นัดหมายเข้าเยี่ยม","ติดตามเคลมยาง","ติดตามการชำระเงิน","ตรวจเช็กรถก่อนส่งมอบ","แนะนำโปรแกรมเช่าซื้อ"];
companies.forEach((c) => {
  if (rand() > 0.45) {
    followUpTasks.push({
      id: `FT${pad(taskSeq,4)}`, companyId: c.id,
      taskTitle: pick(taskTitles), assignedTo: c.salesOwner,
      dueDate: thDate(-randInt(1,30)),
      priority: pick(["สูง","ปานกลาง","ต่ำ"] as const),
      status: pick(["รอดำเนินการ","กำลังดำเนินการ","เสร็จสิ้น"] as const),
    });
    taskSeq++;
  }
});

// ---- Helpers ----
export const getCompanyVehicles = (id: string) => vehicles.filter(v => v.companyId === id);
export const getCompanyServiceRecords = (id: string) => serviceRecords.filter(s => s.companyId === id);
export const getVehicleServiceRecords = (id: string) => serviceRecords.filter(s => s.vehicleId === id).sort((a,b) => a.serviceDateISO < b.serviceDateISO ? 1 : -1);
export const getCompanyVisits = (id: string) => visitLogs.filter(v => v.companyId === id);
export const getCompanyTasks = (id: string) => followUpTasks.filter(t => t.companyId === id);
export const getCompanyById = (id: string) => companies.find(c => c.id === id);
export const getVehicleById = (id: string) => vehicles.find(v => v.id === id);

export function companySummary(companyId: string) {
  const vs = getCompanyVehicles(companyId);
  const srs = getCompanyServiceRecords(companyId);
  const roSet = new Set(srs.map(s => s.roNumber));
  const totalCost = srs.reduce((sum,s) => sum + s.totalCost, 0);
  const vehiclesWithService = new Set(srs.map(s => s.vehicleId));
  const lastVisit = getCompanyVisits(companyId).sort((a,b) => a.visitDate < b.visitDate ? 1 : -1)[0];
  const nextTask = getCompanyTasks(companyId).filter(t => t.status !== "เสร็จสิ้น").sort((a,b) => a.dueDate > b.dueDate ? 1 : -1)[0];
  return {
    totalVehicles: vs.length,
    iksVehicles: vs.filter(v => v.ownershipStatus === "IKS_PURCHASE").length,
    nonIksVehicles: vs.filter(v => v.ownershipStatus === "NON_IKS_PURCHASE").length,
    unknownVehicles: vs.filter(v => v.ownershipStatus === "UNKNOWN").length,
    vehiclesServiced: vehiclesWithService.size,
    totalServiceCount: roSet.size,
    totalServiceCost: totalCost,
    lastVisitDate: lastVisit?.visitDate,
    nextTaskDate: nextTask?.dueDate,
  };
}

export function vehicleSummary(vehicleId: string) {
  const srs = getVehicleServiceRecords(vehicleId);
  const roSet = new Set(srs.map(s => s.roNumber));
  const totalCost = srs.reduce((sum,s) => sum + s.totalCost, 0);
  const last = srs[0];
  const typeCounts: Record<string,number> = {};
  srs.forEach(s => (typeCounts[s.serviceType] = (typeCounts[s.serviceType]||0)+1));
  const topType = Object.entries(typeCounts).sort((a,b) => b[1]-a[1])[0]?.[0];
  return { serviceCount: roSet.size, totalCost, lastServiceDate: last?.serviceDate, lastServiceDateISO: last?.serviceDateISO, lastServiceCost: last?.totalCost, topServiceType: topType, lastMileage: last?.mileage };
}

export const formatBaht = (n: number) => new Intl.NumberFormat("th-TH").format(n);
