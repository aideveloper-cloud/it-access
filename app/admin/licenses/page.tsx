import Link from "next/link";
import { db, daysUntil, type License } from "@/lib/db";
import { LICENSE_WARN_DAYS, formatBaht } from "@/lib/constants";
import { paginate, parsePage } from "@/lib/pagination";
import Pagination from "@/components/Pagination";

export const metadata = { title: "License — KGarden IT Asset" };
export const dynamic = "force-dynamic";

function ExpiryBadge({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr);
  if (days === null) return <span className="text-ink-subtle">-</span>;
  if (days < 0)
    return <span className="badge bg-danger/10 text-danger">หมดอายุแล้ว {-days} วัน</span>;
  if (days <= LICENSE_WARN_DAYS)
    return <span className="badge bg-warning/10 text-warning">อีก {days} วัน</span>;
  return <span className="text-xs text-ink-subtle">อีก {days} วัน</span>;
}

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await searchParams;
  const all = db
    .prepare(
      `SELECT * FROM licenses ORDER BY
       CASE WHEN expire_date = '' THEN 1 ELSE 0 END, expire_date`
    )
    .all() as unknown as License[];
  const { items: licenses, total, page, totalPages, from, to } = paginate(all, parsePage(pageRaw));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="page-title">
          License / บริการที่ต้องต่ออายุ{" "}
          <span className="text-sm font-normal text-ink-subtle">({total} รายการ)</span>
        </h1>
        <Link href="/admin/licenses/new" className="btn btn-primary ml-auto">
          + เพิ่ม License
        </Link>
      </div>
      <p className="text-sm text-ink-subtle">
        เรียงตามวันหมดอายุ — เหลือไม่เกิน {LICENSE_WARN_DAYS} วันจะขึ้นเตือนที่หน้าภาพรวมด้วย
      </p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-muted text-left text-xs text-ink-muted">
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">หมวด</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">จำนวน</th>
                <th className="px-4 py-3">บัญชี</th>
                <th className="px-4 py-3">หมดอายุ</th>
                <th className="px-4 py-3">เหลือเวลา</th>
                <th className="px-4 py-3 text-right">ค่าใช้จ่าย/รอบ</th>
                <th className="px-4 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {licenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-ink-subtle">
                    ยังไม่มี License — กด &quot;+ เพิ่ม License&quot; เพื่อเริ่มบันทึก
                  </td>
                </tr>
              ) : (
                licenses.map((l) => (
                  <tr key={l.id} className="border-b border-hairline last:border-0 hover:bg-surface-muted">
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/licenses/${l.id}/edit`} className="font-medium text-accent hover:underline">
                        {l.name}
                      </Link>
                      {l.note && <div className="text-xs text-ink-subtle">{l.note}</div>}
                    </td>
                    <td className="px-4 py-2.5">{l.category}</td>
                    <td className="px-4 py-2.5">{l.vendor || "-"}</td>
                    <td className="px-4 py-2.5">{l.seats || "-"}</td>
                    <td className="px-4 py-2.5">{l.account || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">{l.expire_date || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {l.status === "ใช้งาน" ? <ExpiryBadge dateStr={l.expire_date} /> : "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      {l.cost > 0 ? `${formatBaht(l.cost)} ฿` : "-"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`badge ${
                          l.status === "ใช้งาน" ? "bg-accent-soft text-accent" : "bg-surface-muted text-ink-muted"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/admin/licenses"
          page={page}
          totalPages={totalPages}
          total={total}
          from={from}
          to={to}
        />
      </div>
    </div>
  );
}
