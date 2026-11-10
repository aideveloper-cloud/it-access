import Link from "next/link";
import { db, type AssetLog } from "@/lib/db";
import { LOG_ACTIONS, formatBaht } from "@/lib/constants";
import { paginate, parsePage } from "@/lib/pagination";
import Pagination from "@/components/Pagination";

export const metadata = { title: "ประวัติการซ่อม — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; page?: string }>;
}) {
  const { q = "", action = "", page: pageRaw } = await searchParams;

  let sql = `SELECT l.*, a.asset_code FROM asset_logs l
             JOIN assets a ON a.id = l.asset_id WHERE 1=1`;
  const params: string[] = [];
  if (q) {
    sql += " AND (a.asset_code LIKE ? OR l.detail LIKE ? OR l.action LIKE ?)";
    params.push(...Array(3).fill(`%${q}%`));
  }
  if (action) {
    sql += " AND l.action = ?";
    params.push(action);
  }
  sql += " ORDER BY l.id DESC";
  const all = db.prepare(sql).all(...params) as unknown as AssetLog[];
  const { items: logs, total, page, totalPages, from, to } = paginate(all, parsePage(pageRaw));
  const query = { q, action };

  return (
    <div className="space-y-4">
      <h1 className="page-title">
        ประวัติการซ่อม / ความเคลื่อนไหว{" "}
        <span className="text-sm font-normal text-ink-subtle">({total} รายการ)</span>
      </h1>
      <p className="text-sm text-ink-subtle">
        รวมบันทึกทุกเครื่อง — เจอปัญหาซ้ำ ค้นหาวิธีแก้เดิมได้ที่นี่
      </p>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="ค้นหา รหัสเครื่อง / รายละเอียด..." className="input w-64" />
        <select name="action" defaultValue={action} className="input w-auto">
          <option value="">— ทุกประเภท —</option>
          {LOG_ACTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
          <option value="เปลี่ยนผู้ถือครอง">เปลี่ยนผู้ถือครอง</option>
          <option value="โอนย้ายผู้ถือครอง">โอนย้ายผู้ถือครอง</option>
          <option value="เปลี่ยนแผนก">เปลี่ยนแผนก</option>
          <option value="เปลี่ยนสถานที่">เปลี่ยนสถานที่</option>
          <option value="เปลี่ยนสถานะ">เปลี่ยนสถานะ</option>
        </select>
        <button className="btn btn-primary">ค้นหา</button>
        <Link href="/admin/history" className="btn btn-secondary">ล้าง</Link>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-muted text-left text-xs text-ink-muted">
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">อุปกรณ์</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">รายละเอียด</th>
                <th className="px-4 py-3 text-right">ค่าใช้จ่าย</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-ink-subtle">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-b border-hairline align-top last:border-0 hover:bg-surface-muted">
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-subtle">{l.created_at}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/assets/${l.asset_id}`} className="code-chip font-medium text-accent hover:underline">
                        {l.asset_code}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">{l.action}</td>
                    <td className="whitespace-pre-wrap px-4 py-2.5 text-ink-muted">{l.detail || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {l.cost > 0 ? `${formatBaht(l.cost)} ฿` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/admin/history"
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
