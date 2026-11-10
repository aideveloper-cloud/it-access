import Link from "next/link";
import QRCode from "qrcode";
import { db, type Asset } from "@/lib/db";
import { CATEGORIES, ASSET_STATUSES } from "@/lib/constants";
import { assetScanUrl } from "@/lib/asset-url";
import { paginate, parsePage } from "@/lib/pagination";
import AssetLabelSheet from "@/components/AssetLabelSheet";
import Pagination from "@/components/Pagination";

export const metadata = { title: "พิมพ์ Label — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default async function BulkLabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; page?: string }>;
}) {
  const { q = "", category = "", status = "", page: pageRaw } = await searchParams;

  let sql = "SELECT * FROM assets WHERE status != 'จำหน่ายแล้ว'";
  const params: string[] = [];
  if (q) {
    sql +=
      " AND (asset_code LIKE ? OR brand LIKE ? OR model LIKE ? OR holder LIKE ?)";
    params.push(...Array(4).fill(`%${q}%`));
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
  const all = db.prepare(sql).all(...params) as unknown as Asset[];
  const { items: assets, total, page, totalPages, from, to } = paginate(all, parsePage(pageRaw));
  const query = { q, category, status };

  const labels = await Promise.all(
    assets.map(async (a) => ({
      id: a.id,
      asset_code: a.asset_code,
      qrDataUrl: await QRCode.toDataURL(assetScanUrl(a.asset_code), { margin: 1, width: 120 }),
    }))
  );

  return (
    <div className="label-print-root space-y-4">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <h1 className="page-title">
          พิมพ์ Label <span className="text-sm font-normal text-ink-subtle">({total} รายการ)</span>
        </h1>
        <Link href="/admin/assets" className="ml-auto text-sm text-accent hover:underline">
          ← กลับทะเบียนอุปกรณ์
        </Link>
      </div>

      <p className="text-sm text-ink-subtle print:hidden">
        ติ๊กเลือก Label ที่ต้องการ (ใบเดียวหรือหลายใบ) แล้วกดพิมพ์ — แสดงหน้าละ 10 รายการ
      </p>

      <form className="flex flex-wrap items-center gap-2 print:hidden" method="get">
        <input name="q" defaultValue={q} placeholder="ค้นหา..." className="input w-48" />
        <select name="category" defaultValue={category} className="input w-auto">
          <option value="">— ทุกหมวด —</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="input w-auto">
          <option value="">— ทุกสถานะ —</option>
          {ASSET_STATUSES.filter((s) => s !== "จำหน่ายแล้ว").map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn-primary">กรอง</button>
      </form>

      {labels.length === 0 ? (
        <p className="text-ink-subtle">ไม่พบอุปกรณ์</p>
      ) : (
        <>
          <AssetLabelSheet labels={labels} />
          <div className="card print:hidden">
            <Pagination
              basePath="/admin/assets/labels"
              page={page}
              totalPages={totalPages}
              total={total}
              from={from}
              to={to}
              query={query}
            />
          </div>
        </>
      )}
    </div>
  );
}
