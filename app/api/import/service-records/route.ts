import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames.find((n) => n.includes("ข้อมูล")) || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    let success = 0, failed = 0;
    const errors: string[] = [];

    const toDateStr = (v: unknown): string | null => {
      if (!v) return null;
      if (v instanceof Date) return v.toISOString().split("T")[0];
      const s = String(v).trim();
      return s ? s.slice(0, 10) : null;
    };
    const toBool = (v: unknown): number => (!v ? 0 : String(v).toUpperCase().startsWith("Y") ? 1 : 0);
    const g = (row: Record<string, unknown>, ...keys: string[]) => {
      for (const k of keys) { if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k]; }
      return null;
    };

    for (const row of rows) {
      try {
        const id = g(row, "id", "รหัส");
        if (!id) { failed++; errors.push("แถวขาด id"); continue; }
        await pool.query(
          `INSERT INTO service_records
            (id, companyId, vehicleId, roNumber, serviceDate, serviceDateISO,
             serviceType, serviceDetail, mileage, serviceCenter, serviceAdvisor,
             totalCost, warrantyCost, customerPaidAmount, boughtTyre, boughtBattery, boughtISP)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             serviceDate=VALUES(serviceDate), serviceDateISO=VALUES(serviceDateISO),
             serviceType=VALUES(serviceType), serviceDetail=VALUES(serviceDetail),
             mileage=VALUES(mileage), serviceCenter=VALUES(serviceCenter),
             serviceAdvisor=VALUES(serviceAdvisor), totalCost=VALUES(totalCost),
             warrantyCost=VALUES(warrantyCost), customerPaidAmount=VALUES(customerPaidAmount),
             boughtTyre=VALUES(boughtTyre), boughtBattery=VALUES(boughtBattery), boughtISP=VALUES(boughtISP)`,
          [
            String(id),
            String(g(row, "companyId", "รหัสบริษัท") ?? ""),
            String(g(row, "vehicleId", "รหัสรถ") ?? ""),
            String(g(row, "roNumber", "เลขที่ใบสั่งงาน") ?? ""),
            String(g(row, "serviceDate", "วันที่เข้าบริการ") ?? ""),
            toDateStr(g(row, "serviceDateISO", "วันที่เข้าบริการ ISO", "serviceDate", "วันที่เข้าบริการ")),
            String(g(row, "serviceType", "ประเภทบริการ") ?? ""),
            String(g(row, "serviceDetail", "รายละเอียด") ?? ""),
            Number(g(row, "mileage", "เลขไมล์") ?? 0),
            String(g(row, "serviceCenter", "ศูนย์บริการ") ?? ""),
            String(g(row, "serviceAdvisor", "ที่ปรึกษาบริการ") ?? ""),
            Number(g(row, "totalCost", "ค่าใช้จ่ายรวม") ?? 0),
            Number(g(row, "warrantyCost", "ค่าใช้จ่ายประกัน") ?? 0),
            Number(g(row, "customerPaidAmount", "ลูกค้าจ่าย") ?? 0),
            toBool(g(row, "boughtTyre", "ซื้อยาง")),
            toBool(g(row, "boughtBattery", "ซื้อแบต")),
            toBool(g(row, "boughtISP", "ซื้อ ISP")),
          ]
        );
        success++;
      } catch (e: any) {
        failed++;
        if (errors.length < 10) errors.push(String(e.message).slice(0, 120));
      }
    }
    return NextResponse.json({ success, failed, total: rows.length, errors });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
