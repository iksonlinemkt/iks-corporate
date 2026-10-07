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
    const g = (row: Record<string, unknown>, ...keys: string[]) => {
      for (const k of keys) { if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k]; }
      return null;
    };

    for (const row of rows) {
      try {
        const id = g(row, "id", "รหัสรถ");
        if (!id) { failed++; errors.push("แถวขาด id"); continue; }
        await pool.query(
          `INSERT INTO vehicles
            (id, companyId, engineNumber, registrationNumber, vehicleModel, vehicleGroup,
             vehicleSubtype, chassisNumber, ownershipStatus, vehicleStatus,
             purchaseYear, purchaseDateISO, sellingPrice, lastTyreDate, lastBatteryDate, lastISPDate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             companyId=VALUES(companyId), engineNumber=VALUES(engineNumber),
             registrationNumber=VALUES(registrationNumber), vehicleModel=VALUES(vehicleModel),
             vehicleGroup=VALUES(vehicleGroup), vehicleSubtype=VALUES(vehicleSubtype),
             chassisNumber=VALUES(chassisNumber), ownershipStatus=VALUES(ownershipStatus),
             vehicleStatus=VALUES(vehicleStatus), purchaseYear=VALUES(purchaseYear),
             purchaseDateISO=VALUES(purchaseDateISO), sellingPrice=VALUES(sellingPrice),
             lastTyreDate=VALUES(lastTyreDate), lastBatteryDate=VALUES(lastBatteryDate),
             lastISPDate=VALUES(lastISPDate)`,
          [
            String(id),
            String(g(row, "companyId", "รหัสบริษัท") ?? ""),
            String(g(row, "engineNumber", "เลขเครื่องยนต์") ?? ""),
            String(g(row, "registrationNumber", "ทะเบียน") ?? ""),
            String(g(row, "vehicleModel", "รุ่นรถ") ?? ""),
            String(g(row, "vehicleGroup", "กลุ่มรถ") ?? ""),
            String(g(row, "vehicleSubtype", "ประเภทย่อย") ?? ""),
            String(g(row, "chassisNumber", "เลขตัวถัง") ?? ""),
            String(g(row, "ownershipStatus", "สถานะการซื้อ") ?? ""),
            String(g(row, "vehicleStatus", "สถานะรถ") ?? ""),
            g(row, "purchaseYear", "ปีที่ซื้อ") ? Number(g(row, "purchaseYear", "ปีที่ซื้อ")) : null,
            toDateStr(g(row, "purchaseDateISO", "วันที่ซื้อ ISO")),
            g(row, "sellingPrice", "ราคาขาย") ? Number(g(row, "sellingPrice", "ราคาขาย")) : null,
            toDateStr(g(row, "lastTyreDate", "วันซื้อยางล่าสุด")),
            toDateStr(g(row, "lastBatteryDate", "วันซื้อแบตล่าสุด")),
            toDateStr(g(row, "lastISPDate", "วันซื้อ ISP ล่าสุด")),
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
