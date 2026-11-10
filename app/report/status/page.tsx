import { lookupCase } from "@/lib/report-actions";
import { CaseStatusBadge, CaseTeamBadge } from "@/components/CaseBadge";
import Link from "next/link";

export const metadata = { title: "ตรวจสอบสถานะเคส — KGarden" };

export default async function ReportStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; reported_by?: string }>;
}) {
  const { id = "", reported_by = "" } = await searchParams;
  const caseId = Number(id);
  const result =
    caseId && reported_by ? await lookupCase(caseId, reported_by) : null;

  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8">
        <h1 className="page-title">ตรวจสอบสถานะเคส</h1>
        <p className="mt-2 text-sm text-ink-muted">
          กรอกเลขเคสและชื่อผู้แจ้งที่ใช้ตอนส่งแบบฟอร์ม
        </p>

        <form method="get" className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">เลขเคส</label>
            <input
              name="id"
              type="number"
              min="1"
              defaultValue={id}
              required
              className="input"
              placeholder="เช่น 12"
            />
          </div>
          <div>
            <label className="label">ชื่อผู้แจ้ง</label>
            <input
              name="reported_by"
              defaultValue={reported_by}
              required
              className="input"
              placeholder="ชื่อที่กรอกตอนแจ้ง"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="btn btn-primary">ค้นหา</button>
          </div>
        </form>
      </div>

      {id && reported_by && !result && (
        <div className="rounded-xl border border-warning/25 bg-warning/5 p-5 text-sm text-warning">
          ไม่พบเคส — ตรวจสอบเลขเคสและชื่อผู้แจ้งให้ตรงกับตอนส่งแบบฟอร์ม
        </div>
      )}

      {result && (
        <div className="card p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">
              เคส <span className="code-chip">#{result.id}</span>
            </h2>
            <CaseStatusBadge status={result.status} />
            <CaseTeamBadge team={result.team} />
          </div>
          <p className="mt-3 font-medium text-ink">{result.title}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-subtle">วันที่แจ้ง</dt>
              <dd>{result.created_at}</dd>
            </div>
            <div>
              <dt className="text-ink-subtle">อัปเดตล่าสุด</dt>
              <dd>{result.updated_at}</dd>
            </div>
          </dl>
        </div>
      )}

      <p className="text-center text-sm text-ink-subtle">
        <Link href="/report" className="text-accent hover:underline">
          ← กลับไปแจ้งปัญหา
        </Link>
      </p>
    </div>
  );
}
