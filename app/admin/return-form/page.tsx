import { db, assetOwnerLabel, type Asset } from "@/lib/db";
import ITAssetReturnSheet from "@/components/ITAssetReturnSheet";

export const metadata = { title: "IT Asset Return Form — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default function ReturnFormPage() {
  const raw = db
    .prepare(
      `SELECT asset_code, brand, model, category, holder, department, shared_use
       FROM assets WHERE status != 'จำหน่ายแล้ว' ORDER BY asset_code`
    )
    .all() as Pick<Asset, "asset_code" | "brand" | "model" | "category" | "holder" | "department" | "shared_use">[];

  const assets = raw.map((a) => ({
    asset_code: a.asset_code,
    brand: a.brand,
    model: a.model,
    category: a.category,
    holder: assetOwnerLabel(a),
    department: a.department,
  }));

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
  const seq = String(
    (db.prepare("SELECT COUNT(*) n FROM assets").get() as { n: number }).n + 1
  ).padStart(4, "0");

  return (
    <div className="space-y-4">
      <h1 className="page-title">IT Asset Return Form</h1>
      <p className="text-sm text-ink-subtle print:hidden">
        แบบฟอร์มส่งคืนอุปกรณ์ — กรอกข้อมูลแล้วกดพิมพ์
      </p>
      <ITAssetReturnSheet defaultDocNo={`IT-RF-${seq}`} defaultDate={today} assets={assets} />
    </div>
  );
}
