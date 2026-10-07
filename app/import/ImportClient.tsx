"use client";
import { useState, useRef } from "react";
import { Upload, CheckCircle, FileSpreadsheet, AlertCircle } from "lucide-react";

type ImportResult = {
  success: number;
  failed: number;
  total: number;
  errors?: string[];
};

export default function ImportClient() {
  const [activeTab, setActiveTab] = useState<"service" | "vehicle">("service");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    setFile(f);
    setResult(null);
    setError(null);
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const endpoint =
        activeTab === "service"
          ? "/api/import/service-records"
          : "/api/import/vehicles";
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-5">นำเข้าข้อมูล</h1>
      <div className="flex gap-1 bg-iks-surface rounded-xl p-1 mb-6 w-fit">
        {[
          { key: "service", label: "ยอดเข้าบริการ" },
          { key: "vehicle", label: "ยอดขายรถ" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTab(t.key as any);
              setFile(null);
              setResult(null);
              setError(null);
            }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.key
                ? "bg-iks-navy text-white shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-card border border-iks-border p-6 mb-4">
        <h3 className="font-semibold text-iks-navy text-sm mb-4">
          อัพโหลดไฟล์{" "}
          {activeTab === "service" ? "ยอดเข้าบริการ" : "ยอดขายรถ"} (.xlsx)
        </h3>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0] || null);
          }}
          className="border-2 border-dashed border-iks-border rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-iks-navy/50 hover:bg-iks-surface/50 transition-all"
        >
          {file ? (
            <>
              <FileSpreadsheet size={40} className="text-green-500" />
              <div className="font-medium text-gray-700">{file.name}</div>
              <div className="text-xs text-gray-400">
                {(file.size / 1024).toFixed(0)} KB
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-xs text-red-400 hover:text-red-600 mt-1"
              >
                เลือกไฟล์ใหม่
              </button>
            </>
          ) : (
            <>
              <Upload size={36} className="text-gray-300" />
              <div className="text-gray-500 text-sm">
                ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์
              </div>
              <div className="text-xs text-gray-400">รองรับ .xlsx เท่านั้น</div>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
        />
      </div>
      <div className="text-xs text-gray-400 mb-4 px-1">
        {activeTab === "service" ? (
          <>คอลัมน์ที่ต้องการ: <span className="text-gray-600">id, companyId, vehicleId, roNumber, serviceDateISO, serviceType, mileage, serviceCenter, serviceAdvisor, totalCost, warrantyCost, customerPaidAmount, boughtTyre (Y/N), boughtBattery (Y/N), boughtISP (Y/N)</span></>
        ) : (
          <>คอลัมน์ที่ต้องการ: <span className="text-gray-600">id, companyId, engineNumber, registrationNumber, vehicleModel, vehicleGroup, ownershipStatus, vehicleStatus, purchaseYear, purchaseDateISO, sellingPrice</span></>
        )}
      </div>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="px-6 py-2.5 bg-iks-navy text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-iks-navyLight transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              กำลังนำเข้า...
            </>
          ) : "นำเข้าข้อมูล"}
        </button>
      </div>
      {result && (
        <div className="bg-white rounded-xl shadow-card border border-iks-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-green-500" />
            <h3 className="font-semibold text-gray-800">ผลการนำเข้า</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatBox label="ทั้งหมด" value={result.total} color="text-gray-700" />
            <StatBox label="สำเร็จ" value={result.success} color="text-green-600" />
            <StatBox label="ล้มเหลว" value={result.failed} color="text-red-500" />
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3 text-xs text-red-500 space-y-1 bg-red-50 p-3 rounded-lg">
              {result.errors.map((e, i) => <div key={i}>• {e}</div>)}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
          <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-iks-surface rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}
