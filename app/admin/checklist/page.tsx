import { db, type Asset } from "@/lib/db";
import ITAssetChecklistSheet from "@/components/ITAssetChecklistSheet";

export const metadata = { title: "IT Asset Checklist — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default function ChecklistPage() {
  const raw = db
    .prepare(
      "SELECT asset_code, brand, model, category FROM assets WHERE status != 'จำหน่ายแล้ว' ORDER BY asset_code"
    )
    .all() as Pick<Asset, "asset_code" | "brand" | "model" | "category">[];
  const assets = raw.map((a) => ({
    asset_code: a.asset_code,
    brand: a.brand,
    model: a.model,
    category: a.category,
  }));

  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
  const seq = String(
    (db.prepare("SELECT COUNT(*) n FROM assets").get() as { n: number }).n + 1
  ).padStart(4, "0");

  return (
    <div className="space-y-4">
      <h1 className="page-title">IT Asset Checklist</h1>
      <p className="text-sm text-ink-subtle print:hidden">
        แบบฟอร์มรับมอบอุปกรณ์ตาม Template 2026 — กรอกข้อมูลแล้วกดพิมพ์
      </p>
      <ITAssetChecklistSheet defaultDocNo={`IT-CL-${seq}`} defaultDate={today} assets={assets} />
    </div>
  );
}
