import Link from "next/link";
import { db, type Case } from "@/lib/db";
import { CASE_TYPES, CASE_STATUSES, CASE_TEAMS, CASE_SOURCE_LABELS } from "@/lib/constants";
import { updateCaseStatus } from "@/lib/actions";
import { formatCaseNo } from "@/lib/case-display";
import { paginate, parsePage } from "@/lib/pagination";
import { CaseStatusBadge, CaseTeamBadge, CasePriorityBadge } from "@/components/CaseBadge";
import CaseStatusForm from "@/components/CaseStatusForm";
import Pagination from "@/components/Pagination";

export const metadata = { title: "รับเคส — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; team?: string; type?: string; page?: string }>;
}) {
  const { q = "", status = "", team = "", type = "", page: pageRaw } = await searchParams;

  let sql = `SELECT c.*, a.asset_code FROM cases c
    LEFT JOIN assets a ON a.id = c.asset_id WHERE 1=1`;
  const params: string[] = [];
  if (q) {
    sql += " AND (c.title LIKE ? OR c.reported_by LIKE ? OR c.department LIKE ? OR c.description LIKE ?)";
    params.push(...Array(4).fill(`%${q}%`));
  }
  if (status) {
    sql += " AND c.status = ?";
    params.push(status);
  }
  if (team) {
    sql += " AND c.team = ?";
    params.push(team);
  }
  if (type) {
    sql += " AND c.case_type = ?";
    params.push(type);
  }
  sql += ` ORDER BY
    CASE c.status WHEN 'รอรับ' THEN 0 WHEN 'กำลังดำเนินการ' THEN 1 WHEN 'รอข้อมูล' THEN 2 ELSE 3 END,
    CASE c.priority WHEN 'ด่วนมาก' THEN 0 WHEN 'ด่วน' THEN 1 ELSE 2 END,
    c.id DESC`;
  const all = db.prepare(sql).all(...params) as unknown as Case[];
  const { items: cases, total, page, totalPages, from, to } = paginate(all, parsePage(pageRaw));
  const query = { q, status, team, type };

  const pending = (db.prepare("SELECT COUNT(*) n FROM cases WHERE status = 'รอรับ'").get() as { n: number }).n;
  const inProgress = (db.prepare("SELECT COUNT(*) n FROM cases WHERE status = 'กำลังดำเนินการ'").get() as { n: number }).n;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="page-title">
          รับเคส <span className="text-sm font-normal text-ink-subtle">({total} รายการ)</span>
        </h1>
        <Link href="/admin/cases/new" className="btn btn-primary ml-auto">
          + รับเคส (โทร/ไลน์)
        </Link>
      </div>

      <p className="text-sm text-ink-subtle">
        พนักงานแจ้งเคสผ่าน{" "}
        <a href="/report" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          /report
        </a>{" "}
        — เคสจะเข้ามาที่นี่อัตโนมัติ
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card bg-warning/5 p-4 ring-1 ring-warning/20">
          <div className="text-2xl font-semibold tracking-tight text-warning">{pending}</div>
          <div className="text-xs text-warning">รอรับ</div>
        </div>
        <div className="card bg-info/5 p-4 ring-1 ring-info/20">
          <div className="text-2xl font-semibold tracking-tight text-info">{inProgress}</div>
          <div className="text-xs text-info">กำลังดำเนินการ</div>
        </div>
        <div className="card bg-info/5 p-4 ring-1 ring-info/20">
          <div className="text-2xl font-semibold tracking-tight text-info">
            {(db.prepare("SELECT COUNT(*) n FROM cases WHERE team = 'IT Support' AND status NOT IN ('เสร็จแล้ว','ยกเลิก')").get() as { n: number }).n}
          </div>
          <div className="text-xs text-info">IT Support (เปิดอยู่)</div>
        </div>
        <div className="card bg-accent-soft p-4 ring-1 ring-accent/20">
          <div className="text-2xl font-semibold tracking-tight text-accent">
            {(db.prepare("SELECT COUNT(*) n FROM cases WHERE team = 'Dev' AND status NOT IN ('เสร็จแล้ว','ยกเลิก')").get() as { n: number }).n}
          </div>
          <div className="text-xs text-accent">Dev (เปิดอยู่)</div>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-2" method="get">
        <input name="q" defaultValue={q} placeholder="ค้นหา หัวข้อ / ผู้แจ้ง / แผนก..." className="input w-64" />
        <select name="status" defaultValue={status} className="input w-auto">
          <option value="">— ทุกสถานะ —</option>
          {CASE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select name="team" defaultValue={team} className="input w-auto">
          <option value="">— ทุกทีม —</option>
          {CASE_TEAMS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} className="input w-auto">
          <option value="">— ทุกประเภท —</option>
          {CASE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button className="btn btn-primary">ค้นหา</button>
        <Link href="/admin/cases" className="btn btn-secondary">ล้าง</Link>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline bg-surface-muted text-left text-xs text-ink-muted">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">หัวข้อ</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">ทีม</th>
                <th className="px-4 py-3">รับจาก</th>
                <th className="px-4 py-3">ช่องทาง</th>
                <th className="px-4 py-3">ความเร่งด่วน</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">วันที่แจ้ง</th>
              </tr>
            </thead>
            <tbody>
              {cases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-ink-subtle">ไม่พบเคส</td>
                </tr>
              ) : (
                cases.map((c) => (
                  <tr key={c.id} className="border-b border-hairline last:border-0 hover:bg-surface-muted">
                    <td className="px-4 py-2.5 text-ink-subtle">{formatCaseNo(c)}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/admin/cases/${c.id}`} className="font-medium text-accent hover:underline">
                        {c.title}
                      </Link>
                      {c.asset_code && (
                        <div className="text-xs text-ink-subtle">อุปกรณ์: {c.asset_code}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{c.case_type}</td>
                    <td className="px-4 py-2.5"><CaseTeamBadge team={c.team} /></td>
                    <td className="px-4 py-2.5">
                      <div>{c.reported_by}</div>
                      {c.department && <div className="text-xs text-ink-subtle">{c.department}</div>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-ink-subtle">
                      {CASE_SOURCE_LABELS[c.source] ?? c.source}
                    </td>
                    <td className="px-4 py-2.5"><CasePriorityBadge priority={c.priority} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-col gap-1">
                        <CaseStatusBadge status={c.status} />
                        <CaseStatusForm
                          currentStatus={c.status}
                          action={updateCaseStatus.bind(null, c.id)}
                          compact
                        />
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-ink-subtle">{c.created_at}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          basePath="/admin/cases"
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
