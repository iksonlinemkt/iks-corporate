export type OwnershipStatus = "IKS_PURCHASE" | "NON_IKS_PURCHASE" | "UNKNOWN";
export type IksPurchaseStatus = "IKS_CUSTOMER" | "NON_IKS_CUSTOMER" | "PENDING_VERIFICATION";
export type OpportunityLevel = "HOT" | "WARM" | "COLD" | "NONE";
export type VehicleGroup = "P-UP" | "MU-X" | "รถบรรทุก" | "อื่นๆ";
export type VehicleSubtype = "STD" | "SPC NR" | "SPC HR" | "Cab4 NR" | "Cab4 HR" | "-";

export interface Branch { code: string; name: string; }

export interface User {
  id: string; name: string;
  role: "Sales" | "Service Advisor" | "Sales Manager" | "Service Manager" | "Admin";
  branch: string; avatarColor: string;
}

export interface Executive {
  id: string; companyId: string;
  name: string; position: string; phone: string;
  lineId?: string; email?: string; birthday?: string; hobby?: string;
  isPrimary: boolean;
}

export interface Company {
  id: string; name: string; taxId: string;
  businessType: string; businessDescription?: string;
  address: string; province: string; branch: string;
  salesOwner: string; scName?: string; customerGrade?: string;
  iksPurchaseStatus: IksPurchaseStatus;
  opportunityLevel: OpportunityLevel;
  customerSince?: string; customerGroup?: string;
  // Fleet
  truckCount?: number; sedanCount?: number; pickupCount?: number;
  otherBrand?: string; routeDescription?: string;
  replacementCycle?: string; purchaseCondition?: string;
  vehicleNeedCount?: number; vehicleNeedPeriod?: string; bringToService?: number;
  // Maintenance
  preferredServiceCenter?: string; serviceFrequency?: string;
  oilBrand?: string; tyreBrand?: string;
  // Opportunity
  hotInterest?: string; painPoint?: string; clubMember?: string; internalNote?: string;
}

export interface Vehicle {
  id: string; companyId: string;
  registrationNumber: string; registrationProvince: string;
  engineNumber: string; chassisNumber: string;
  vehicleModel: string; vehicleGroup: VehicleGroup; vehicleSubtype: VehicleSubtype;
  vehicleYear: number; purchaseYear: number; purchaseDate: string;
  ownershipStatus: OwnershipStatus;
  vehicleStatus: "พร้อมใช้งาน" | "เข้าศูนย์อยู่" | "ไม่ใช้งาน";
  driverName?: string; driverPhone?: string;
}

export interface ServiceRecord {
  id: string; companyId: string; vehicleId: string;
  roNumber: string; serviceDate: string; serviceDateISO: string;
  serviceType: string; serviceDetail: string; mileage: number;
  serviceCenter: string; serviceAdvisor: string;
  totalCost: number; warrantyCost: number; customerPaidAmount: number;
}

export interface VisitLog {
  id: string; companyId: string; visitDate: string;
  visitorName: string; attendeeName: string; attendeePosition: string;
  objective: string; discussionSummary: string; visitResult: string;
  opportunityLevel: OpportunityLevel; nextAction: string; nextFollowupDate?: string;
}

export interface FollowUpTask {
  id: string; companyId: string; taskTitle: string;
  assignedTo: string; dueDate: string;
  priority: "สูง" | "ปานกลาง" | "ต่ำ";
  status: "รอดำเนินการ" | "กำลังดำเนินการ" | "เสร็จสิ้น";
}
