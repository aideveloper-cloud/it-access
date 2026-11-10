import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db, assetAge, type Asset } from "@/lib/db";
import { isLoggedIn } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!(await isLoggedIn())) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? "";
  const category = sp.get("category") ?? "";
  const status = sp.get("status") ?? "";

  let sql = "SELECT * FROM assets WHERE 1=1";
  const params: string[] = [];
  if (q) {
    sql +=
      " AND (asset_code LIKE ? OR brand LIKE ? OR model LIKE ? OR serial_no LIKE ? OR holder LIKE ? OR location LIKE ?)";
    params.push(...Array(6).fill(`%${q}%`));
  }
  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY category, asset_code";
  const assets = db.prepare(sql).all(...params) as unknown as Asset[];

  const costs = db
    .prepare("SELECT asset_id, SUM(cost) total FROM asset_logs GROUP BY asset_id")
    .all() as { asset_id: number; total: number }[];
  const costMap = new Map(costs.map((c) => [c.asset_id, c.total]));

  const rows = assets.map((a, i) => ({
    "ลำดับ": i + 1,
    "รหัสทรัพย์สิน": a.asset_code,
    "หมวดหมู่": a.category,
    "ยี่ห้อ": a.brand,
    "รุ่น": a.model,
    "Serial Number": a.serial_no,
    "Spec": a.spec,
    "วันที่เปิดใช้งาน": a.start_date,
    "อายุการใช้งาน": assetAge(a.start_date),
    "ผู้ถือครอง": a.holder,
    "แผนก/ตำแหน่ง": a.department,
    "สถานที่": a.location,
    "เบอร์โทร": a.phone,
    "สถานะ": a.status,
    "ค่าซ่อมสะสม (บาท)": costMap.get(a.id) ?? 0,
    "หมายเหตุ": a.note,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = Object.keys(rows[0] ?? { x: 1 }).map((k) => ({
    wch: Math.max(k.length + 2, 12),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "อุปกรณ์");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="it-assets-${today}.xlsx"`,
    },
  });
}
