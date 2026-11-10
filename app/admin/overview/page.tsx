import Link from "next/link";
import { db, assetAge, daysUntil, type Asset, type AssetLog, type License, type Case } from "@/lib/db";
import { ASSET_STATUSES, AGING_YEARS, LICENSE_WARN_DAYS } from "@/lib/constants";
import { formatCaseNo } from "@/lib/case-display";
import StatusBadge from "@/components/StatusBadge";
import { CaseTeamBadge } from "@/components/CaseBadge";

export const metadata = { title: "ภาพรวม — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const total = (db.prepare("SELECT COUNT(*) n FROM assets").get() as { n: number }).n;
  const byStatus = db
    .prepare("SELECT status, COUNT(*) n FROM assets GROUP BY status")
    .all() as { status: string; n: number }[];
  const byCategory = db
    .prepare(
      "SELECT category, COUNT(*) n FROM assets WHERE status != 'จำหน่ายแล้ว' GROUP BY category ORDER BY n DESC"
    )
    .all() as { category: string; n: number }[];
  const recentLogs = db
    .prepare(
      `SELECT l.*, a.asset_code FROM asset_logs l
       JOIN assets a ON a.id = l.asset_id
       ORDER BY l.id DESC LIMIT 8`
    )
    .all() as unknown as AssetLog[];

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - AGING_YEARS);
  const aging = db
    .prepare(
      `SELECT * FROM assets WHERE start_date != '' AND start_date <= ?
       AND status IN ('ใช้งาน','ว่าง') ORDER BY start_date LIMIT 10`
    )
    .all(cutoff.toISOString().slice(0, 10)) as unknown as Asset[];

  const statusCount = (s: string) => byStatus.find((r) => r.status === s)?.n ?? 0;

  const expiring = (
    db
      .prepare("SELECT * FROM licenses WHERE status = 'ใช้งาน' AND expire_date != '' ORDER BY expire_date")
      .all() as unknown as License[]
  ).filter((l) => {
    const days = daysUntil(l.expire_date);
    return days !== null && days <= LICENSE_WARN_DAYS;
  });

  const pendingCases = (db.prepare("SELECT COUNT(*) n FROM cases WHERE status = 'รอรับ'").get() as { n: number }).n;
  const openCases = db
    .prepare(
      `SELECT * FROM cases WHERE status NOT IN ('เสร็จแล้ว','ยกเลิก')
       ORDER BY CASE status WHEN 'รอรับ' THEN 0 WHEN 'กำลังดำเนินการ' THEN 1 ELSE 2 END, id DESC LIMIT 6`
    )
    .all() as unknown as Case[];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-subtle">Dashboard</div>
        <h1 className="page-title mt-1">ภาพรวมระบบ</h1>
      </div>

      {pendingCases > 0 && (
        <div className="rounded-xl border border-warning/25 bg-warning/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning">
            มีเคสรอรับ {pendingCases} รายการ
            <Link href="/admin/cases?status=รอรับ" className="ml-auto font-medium underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <ul className="space-y-1 text-sm text-ink">
            {openCases.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={`/admin/cases/${c.id}`} className="font-medium text-accent hover:underline">
                  #{formatCaseNo(c)} {c.title}
                </Link>{" "}
                · รับจาก {c.reported_by} · <CaseTeamBadge team={c.team} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {expiring.length > 0 && (
        <div className="rounded-xl border border-warning/25 bg-warning/5 p-4">
          <div className="mb-2 text-sm font-semibold text-warning">
            License ใกล้หมดอายุ / หมดอายุแล้ว ({expiring.length} รายการ)
          </div>
          <ul className="space-y-1 text-sm text-ink">
            {expiring.map((l) => {
              const days = daysUntil(l.expire_date)!;
              return (
                <li key={l.id}>
                  <Link href={`/admin/licenses/${l.id}/edit`} className="font-medium text-accent hover:underline">
                    {l.name}
                  </Link>{" "}
                  — {l.expire_date}{" "}
                  {days < 0 ? (
                    <span className="font-semibold text-danger">(หมดอายุแล้ว {-days} วัน)</span>
                  ) : (
                    <span className="text-ink-muted">(เหลืออีก {days} วัน)</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="card p-4">
          <div className="text-2xl font-semibold tracking-tight text-ink">{total}</div>
          <div className="mt-1 text-xs text-ink-subtle">อุปกรณ์ทั้งหมด</div>
        </div>
        {ASSET_STATUSES.map((s) => (
          <div key={s} className="card p-4">
            <div
              className={`text-2xl font-semibold tracking-tight ${
                (s === "ส่งซ่อม" || s === "ใช้งานไม่ได้") && statusCount(s) > 0
                  ? "text-warning"
                  : "text-ink"
              }`}
            >
              {statusCount(s)}
            </div>
            <div className="mt-1 text-xs text-ink-subtle">{s}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title mb-3">อุปกรณ์แยกตามหมวด</h2>
          <table className="w-full text-sm">
            <tbody>
              {byCategory.map((c) => (
                <tr key={c.category} className="border-b border-hairline last:border-0">
                  <td className="py-2.5">
                    <Link
                      href={`/admin/assets?category=${encodeURIComponent(c.category)}`}
                      className="text-accent hover:underline"
                    >
                      {c.category}
                    </Link>
                  </td>
                  <td className="py-2.5 text-right font-medium tabular-nums">{c.n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card p-5">
          <h2 className="section-title mb-3">ความเคลื่อนไหวล่าสุด</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-ink-subtle">ยังไม่มีความเคลื่อนไหว</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentLogs.map((l) => (
                <li key={l.id} className="border-b border-hairline pb-2 last:border-0">
                  <div>
                    <Link
                      href={`/admin/assets/${l.asset_id}`}
                      className="code-chip font-medium text-accent hover:underline"
                    >
                      {l.asset_code}
                    </Link>{" "}
                    · {l.action}
                  </div>
                  {l.detail && <div className="truncate text-xs text-ink-subtle">{l.detail}</div>}
                  <div className="text-xs text-ink-subtle">{l.created_at}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {aging.length > 0 && (
        <section className="card p-5">
          <h2 className="section-title mb-3">
            อุปกรณ์อายุเกิน {AGING_YEARS} ปี (ควรวางแผนเปลี่ยน)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline text-left text-xs text-ink-subtle">
                  <th className="py-2 pr-3 font-medium">รหัส</th>
                  <th className="py-2 pr-3 font-medium">หมวด</th>
                  <th className="py-2 pr-3 font-medium">รุ่น</th>
                  <th className="py-2 pr-3 font-medium">เปิดใช้งาน</th>
                  <th className="py-2 pr-3 font-medium">อายุ</th>
                  <th className="py-2 pr-3 font-medium">ผู้ถือครอง</th>
                  <th className="py-2 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {aging.map((a) => (
                  <tr key={a.id} className="border-b border-hairline last:border-0">
                    <td className="py-2.5 pr-3">
                      <Link href={`/admin/assets/${a.id}`} className="code-chip text-accent hover:underline">
                        {a.asset_code}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-3">{a.category}</td>
                    <td className="py-2.5 pr-3">{`${a.brand} ${a.model}`.trim() || "-"}</td>
                    <td className="py-2.5 pr-3">{a.start_date}</td>
                    <td className="py-2.5 pr-3">{assetAge(a.start_date)}</td>
                    <td className="py-2.5 pr-3">{a.holder || "-"}</td>
                    <td className="py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
