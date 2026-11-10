"use client";

import { useMemo, useState } from "react";

type Row = {
  item: string;
  brand: string;
  tag: string;
  condition: string;
  remarks: string;
};

type SwRow = {
  item: string;
  details: string;
  status: string;
  by: string;
  remarks: string;
};

const HARDWARE_DEFAULT: Row[] = [
  { item: "คอมพิวเตอร์ / โน้ตบุ๊ก (Laptop / PC)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "สายชาร์จ (Power Adapter)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "จอมอนิเตอร์ (Monitor)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "เมาส์ (Mouse)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "คีย์บอร์ด (Keyboard)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "หูฟัง / ไมโครโฟน (Headset / Mic)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "กระเป๋าโน้ตบุ๊ก (Laptop Bag)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "สายแปลง (Dongle / USB Hub)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
  { item: "อุปกรณ์อื่นๆ (Others)", brand: "", tag: "", condition: "ปกติ (Good)", remarks: "" },
];

const SOFTWARE_DEFAULT: SwRow[] = [
  {
    item: "ระบบปฏิบัติการ (Operating System)",
    details: "Windows 11 Pro / macOS",
    status: "เรียบร้อย (Done)",
    by: "IT Staff",
    remarks: "",
  },
  {
    item: "โปรแกรมป้องกันไวรัส (Antivirus / Endpoint Security)",
    details: "Cortex XDR / Defender",
    status: "เรียบร้อย (Done)",
    by: "IT Staff",
    remarks: "",
  },
  {
    item: "บัญชีผู้ใช้งาน & อีเมล (Domain Account / Email / VPN)",
    details: "User Credentials Created",
    status: "เรียบร้อย (Done)",
    by: "IT Staff",
    remarks: "",
  },
  {
    item: "โปรแกรมการทำงานพื้นฐาน (Microsoft 365 / Zoom / Slack)",
    details: "Standard Software Installed",
    status: "เรียบร้อย (Done)",
    by: "IT Staff",
    remarks: "",
  },
];

const CONDITIONS = ["ปกติ (Good)", "ชำรุด (Damaged)", "ไม่ระบุ (N/A)"] as const;
const SOFTWARE_STATUSES = ["เรียบร้อย (Done)", "รอดำเนินการ (Pending)", "N/A"] as const;

const TERMS = [
  "ผู้รับมอบสัญญาว่าจะดูแลรักษาอุปกรณ์ IT ทั้งหมดให้อยู่ในสภาพดี และใช้งานเพื่อวัตถุประสงค์ของบริษัทเท่านั้น",
  "ห้ามนำอุปกรณ์ไปดัดแปลง ถอดแยก หรือติดตั้งโปรแกรมที่ละเมิดลิขสิทธิ์และผิดกฎหมายโดยเด็ดขาด",
  "กรณีอุปกรณ์สูญหายหรือเสียหายอันเกิดจากความประมาทเลินเล่อ ผู้รับมอบจะต้องรับผิดชอบค่าเสียหายตามเงื่อนไขของบริษัท",
  "เมื่อพ้นสภาพการเป็นพนักงาน หรือมีการร้องขอจากบริษัท ผู้รับมอบต้องส่งคืนอุปกรณ์ทั้งหมดในสภาพสมบูรณ์แก่ฝ่าย IT",
];

export type ChecklistAsset = {
  asset_code: string;
  brand: string;
  model: string;
  category: string;
};

export default function ITAssetChecklistSheet({
  defaultDocNo,
  defaultDate,
  assets,
}: {
  defaultDocNo: string;
  defaultDate: string;
  assets: ChecklistAsset[];
}) {
  const [docNo, setDocNo] = useState(defaultDocNo);
  const [docDate, setDocDate] = useState(defaultDate);
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [position, setPosition] = useState("");
  const [dept, setDept] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hw, setHw] = useState<Row[]>(HARDWARE_DEFAULT);
  const [sw, setSw] = useState<SwRow[]>(SOFTWARE_DEFAULT);

  const assetOptions = useMemo(
    () => assets.map((a) => ({ label: `${a.asset_code} — ${a.brand} ${a.model}`.trim(), a })),
    [assets]
  );

  function fillFromAsset(code: string) {
    const found = assets.find((a) => a.asset_code === code);
    if (!found) return;
    setHw((rows) => {
      const next = [...rows];
      const laptop = next[0];
      if (laptop) {
        laptop.brand = `${found.brand} ${found.model}`.trim();
        laptop.tag = found.asset_code;
      }
      return next;
    });
  }

  return (
    <div className="checklist-print-root space-y-4">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="btn btn-primary"
        >
          พิมพ์ Checklist
        </button>
        <p className="text-sm text-ink-subtle">
          Template ตาม IT Asset Checklist — กรอกแล้วกดพิมพ์ (A4)
        </p>
      </div>

      <div className="checklist-sheet card space-y-6 p-6 print:border-0 print:shadow-none print:p-0">
        <header className="border-b border-hairline pb-4 text-center">
          <h1 className="text-lg font-bold text-ink">ใบตรวจสอบและรับมอบอุปกรณ์เทคโนโลยีสารสนเทศ</h1>
          <p className="text-xs text-ink-subtle">IT Asset Handover Checklist</p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm print:gap-8">
            <label className="flex items-center gap-2 print:gap-1">
              <span className="text-ink-muted">เลขที่เอกสาร / Doc No.</span>
              <input
                className="input w-36 print:border-0 print:bg-transparent print:p-0"
                value={docNo}
                onChange={(e) => setDocNo(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 print:gap-1">
              <span className="text-ink-muted">วันที่ / Date</span>
              <input
                type="date"
                className="input w-40 print:border-0 print:bg-transparent print:p-0"
                value={docDate}
                onChange={(e) => setDocDate(e.target.value)}
              />
            </label>
          </div>
        </header>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">
            1. ข้อมูลผู้ถือครอง / ผู้รับมอบ (Employee Information)
          </h2>
          <div className="mb-2 print:hidden">
            <label className="label">ดึงจากทะเบียน (รหัสอุปกรณ์)</label>
            <select
              className="input max-w-md"
              defaultValue=""
              onChange={(e) => fillFromAsset(e.target.value)}
            >
              <option value="">— เลือกอุปกรณ์ —</option>
              {assetOptions.map(({ label, a }) => (
                <option key={a.asset_code} value={a.asset_code}>{label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <label className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-subtle">ชื่อ-นามสกุล / Name</span>
              <input className="input py-1.5 print:border-b print:border-hairline print:rounded-none" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-subtle">รหัสพนักงาน / Emp ID</span>
              <input className="input py-1.5 print:border-b print:border-hairline print:rounded-none" value={empId} onChange={(e) => setEmpId(e.target.value)} />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-subtle">ตำแหน่ง / Position</span>
              <input className="input py-1.5 print:border-b print:border-hairline print:rounded-none" value={position} onChange={(e) => setPosition(e.target.value)} />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-subtle">แผนก/ฝ่าย / Dept</span>
              <input className="input py-1.5 print:border-b print:border-hairline print:rounded-none" value={dept} onChange={(e) => setDept(e.target.value)} />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-subtle">เบอร์ติดต่อ / Phone</span>
              <input className="input py-1.5 print:border-b print:border-hairline print:rounded-none" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
            <label className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-subtle">อีเมล / Email</span>
              <input className="input py-1.5 print:border-b print:border-hairline print:rounded-none" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">
            2. รายการอุปกรณ์ IT (IT Hardware &amp; Accessories Checklist)
          </h2>
          <table className="checklist-table w-full border-collapse text-xs">
            <thead>
              <tr className="bg-surface-muted text-left">
                <th className="border border-hairline px-1 py-1 w-8">ลำดับ</th>
                <th className="border border-hairline px-1 py-1">รายการอุปกรณ์</th>
                <th className="border border-hairline px-1 py-1">ยี่ห้อ / รุ่น</th>
                <th className="border border-hairline px-1 py-1">Asset Tag</th>
                <th className="border border-hairline px-1 py-1">สภาพ</th>
                <th className="border border-hairline px-1 py-1">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {hw.map((row, i) => (
                <tr key={row.item}>
                  <td className="border border-hairline px-1 py-0.5 text-center">{i + 1}</td>
                  <td className="border border-hairline px-1 py-0.5">{row.item}</td>
                  <td className="border border-hairline p-0">
                    <input
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs print:p-0"
                      value={row.brand}
                      onChange={(e) => {
                        const v = e.target.value;
                        setHw((rows) => rows.map((r, j) => (j === i ? { ...r, brand: v } : r)));
                      }}
                    />
                  </td>
                  <td className="border border-hairline p-0">
                    <input
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs font-mono print:p-0"
                      value={row.tag}
                      onChange={(e) => {
                        const v = e.target.value;
                        setHw((rows) => rows.map((r, j) => (j === i ? { ...r, tag: v } : r)));
                      }}
                    />
                  </td>
                  <td className="border border-hairline p-0">
                    <select
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs print:appearance-none print:p-0"
                      value={row.condition}
                      onChange={(e) => {
                        const v = e.target.value;
                        setHw((rows) => rows.map((r, j) => (j === i ? { ...r, condition: v } : r)));
                      }}
                    >
                      {CONDITIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-hairline p-0">
                    <input
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs print:p-0"
                      value={row.remarks}
                      onChange={(e) => {
                        const v = e.target.value;
                        setHw((rows) => rows.map((r, j) => (j === i ? { ...r, remarks: v } : r)));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">
            3. รายการระบบและซอฟต์แวร์ที่ติดตั้ง (Software &amp; System Setup)
          </h2>
          <table className="checklist-table w-full border-collapse text-xs">
            <thead>
              <tr className="bg-surface-muted text-left">
                <th className="border border-hairline px-1 py-1 w-8">ลำดับ</th>
                <th className="border border-hairline px-1 py-1">รายการ</th>
                <th className="border border-hairline px-1 py-1">รายละเอียด</th>
                <th className="border border-hairline px-1 py-1">สถานะ</th>
                <th className="border border-hairline px-1 py-1">ผู้รับผิดชอบ</th>
                <th className="border border-hairline px-1 py-1">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {sw.map((row, i) => (
                <tr key={row.item}>
                  <td className="border border-hairline px-1 py-0.5 text-center">{i + 1}</td>
                  <td className="border border-hairline px-1 py-0.5">{row.item}</td>
                  <td className="border border-hairline p-0">
                    <input
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs print:p-0"
                      value={row.details}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSw((rows) => rows.map((r, j) => (j === i ? { ...r, details: v } : r)));
                      }}
                    />
                  </td>
                  <td className="border border-hairline p-0">
                    <select
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs print:appearance-none print:p-0"
                      value={row.status}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSw((rows) => rows.map((r, j) => (j === i ? { ...r, status: v } : r)));
                      }}
                    >
                      {SOFTWARE_STATUSES.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border border-hairline p-0">
                    <input
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs print:p-0"
                      value={row.by}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSw((rows) => rows.map((r, j) => (j === i ? { ...r, by: v } : r)));
                      }}
                    />
                  </td>
                  <td className="border border-hairline p-0">
                    <input
                      className="w-full border-0 bg-transparent px-1 py-0.5 text-xs print:p-0"
                      value={row.remarks}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSw((rows) => rows.map((r, j) => (j === i ? { ...r, remarks: v } : r)));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-ink">4. ข้อตกลงและเงื่อนไขการใช้งาน (Terms &amp; Conditions)</h2>
          <ol className="list-decimal space-y-1 pl-5 text-xs leading-relaxed text-ink-muted">
            {TERMS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <section className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2 text-sm">
          <div>
            <h3 className="mb-6 font-semibold">ผู้รับมอบอุปกรณ์ / Employee</h3>
            <p className="text-xs text-ink-subtle">ลายเซ็น: _________________________________</p>
            <p className="mt-2 text-xs text-ink-subtle">ชื่อตัวบรรจง: (_______________________________)</p>
            <p className="mt-4 text-xs text-ink-subtle">วันที่ / Date: ____ / ____________ / ________</p>
          </div>
          <div>
            <h3 className="mb-6 font-semibold">ผู้ส่งมอบอุปกรณ์ / IT Staff</h3>
            <p className="text-xs text-ink-subtle">ลายเซ็น: _________________________________</p>
            <p className="mt-2 text-xs text-ink-subtle">ชื่อตัวบรรจง: (_______________________________)</p>
            <p className="mt-4 text-xs text-ink-subtle">วันที่ / Date: ____ / ____________ / ________</p>
          </div>
        </section>
      </div>
    </div>
  );
}
