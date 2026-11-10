import Link from "next/link";
import { db, assetOwnerLabel, type Asset } from "@/lib/db";
import { CATEGORIES, ASSET_STATUSES } from "@/lib/constants";
import { updateAssetStatus } from "@/lib/actions";
import { assetsListPath } from "@/lib/assets-list-path";
import { paginate, parsePage } from "@/lib/pagination";
import StatusBadge from "@/components/StatusBadge";
import StatusChangeForm from "@/components/StatusChangeForm";
import Pagination from "@/components/Pagination";

export const metadata = { title: "อุปกรณ์ — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: string; page?: string }>;
}) {
  const { q = "", category = "", status = "", page: pageRaw } = await searchParams;

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
  const all = db.prepare(sql).all(...params) as unknown as Asset[];
  const { items: assets, total, page, totalPages, from, to } = paginate(all, parsePage(pageRaw));
  const query = { q, category, status };
  const listPath = assetsListPath({ q, category, status, page });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="page-title">
          ทะเบียนอุปกรณ์{" "}
          <span className="text-sm font-normal text-ink-subtle">({total} รายการ)</span>
        </h1>
        <div className="ml-auto flex gap-2">
          <Link
            href={`/admin/assets/labels?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}`}
            className="btn btn-secondary"
          >
            พิมพ์ Label
          </Link>
          <a
            href={`/admin/assets/export?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}`}
            className="btn btn-primary"
          >
            Export Excel
          </a>
          <Link href={`/admin/assets/new?from=${encodeURIComponent(listPath)}`} className="btn btn-primary">
            + เพิ่มอุปกรณ์
          </Link>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="ค้นหา รหัส / รุ่น / SN / ผู้ถือครอง..." className="input w-64" />
        <select name="category" defaultValue={category} className="input w-auto">
          <option value="">— ทุกหมวด —</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="input w-auto">
          <option value="">— ทุกสถานะ —</option>
          {ASSET_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn btn-primary">ค้นหา</button>
        <Link href="/admin/assets" className="btn btn-secondary">ล้าง</Link>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-muted text-left text-xs text-ink-muted">
                <th className="px-4 py-3">รหัส</th>
                <th className="px-4 py-3">หมวด</th>
                <th className="px-4 py-3">ยี่ห้อ / รุ่น</th>
                <th className="px-4 py-3">SN</th>
                <th className="px-4 py-3">ผู้ถือครอง</th>
                <th className="px-4 py-3">สถานที่</th>
                <th className="px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-ink-subtle">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.id} className="border-b border-hairline last:border-0 hover:bg-surface-muted">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/assets/${a.id}?from=${encodeURIComponent(listPath)}`}
                        className="code-chip font-medium text-accent hover:underline"
                      >
                        {a.asset_code}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5">{a.category}</td>
                    <td className="px-4 py-2.5">{`${a.brand} ${a.model}`.trim() || "-"}</td>
                    <td className="px-4 py-2.5">{a.serial_no || "-"}</td>
                    <td className="px-4 py-2.5">
                      {assetOwnerLabel(a)}
                      {a.shared_use === 1 && <span className="ml-1 text-xs text-accent">(ร่วม)</span>}
                    </td>
                    <td className="px-4 py-2.5">{a.location || "-"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={a.status} />
                        <StatusChangeForm
                          assetId={a.id}
                          currentStatus={a.status}
                          action={updateAssetStatus.bind(null, a.id)}
                          compact
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/admin/assets"
          page={page}
          totalPages={totalPages}
          total={total}
          from={from}
          to={to}
          query={query}
        />
      </div>
    </div>
  );
}
