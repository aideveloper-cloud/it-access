import Link from "next/link";
import { notFound } from "next/navigation";
import { db, type Case, type CaseLog } from "@/lib/db";
import { updateCaseStatus, addCaseNote, deleteCase } from "@/lib/actions";
import { formatCaseNo } from "@/lib/case-display";
import { CaseStatusBadge, CaseTeamBadge, CasePriorityBadge } from "@/components/CaseBadge";
import { CASE_SOURCE_LABELS } from "@/lib/constants";
import CaseStatusForm from "@/components/CaseStatusForm";
import DeleteCaseButton from "@/components/DeleteCaseButton";

export const dynamic = "force-dynamic";

const inputCls = "input";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = db
    .prepare(
      `SELECT c.*, a.asset_code FROM cases c
       LEFT JOIN assets a ON a.id = c.asset_id WHERE c.id = ?`
    )
    .get(Number(id)) as Case | undefined;
  if (!c) notFound();

  const logs = db
    .prepare("SELECT * FROM case_logs WHERE case_id = ? ORDER BY id DESC")
    .all(c.id) as unknown as CaseLog[];

  const rows: [string, React.ReactNode][] = [
    ["ช่องทาง", CASE_SOURCE_LABELS[c.source] ?? c.source],
    ["ประเภทเคส", c.case_type],
    ["ทีมรับผิดชอบ", <CaseTeamBadge key="team" team={c.team} />],
    ["รับจาก", c.reported_by],
    ["แผนก", c.department || "-"],
    ["เบอร์ติดต่อ", c.contact || "-"],
    ["ความเร่งด่วน", <CasePriorityBadge key="pri" priority={c.priority} />],
    [
      "อุปกรณ์ที่เกี่ยวข้อง",
      c.asset_id ? (
        <Link key="asset" href={`/admin/assets/${c.asset_id}`} className="text-accent hover:underline">
          {c.asset_code}
        </Link>
      ) : (
        "-"
      ),
    ],
    ["วันที่แจ้ง", c.created_at],
    ["อัปเดตล่าสุด", c.updated_at],
    ...(c.closed_at ? [["ปิดเคส", c.closed_at] as [string, React.ReactNode]] : []),
    ["รายละเอียด", <span key="desc" className="whitespace-pre-wrap">{c.description || "-"}</span>],
    ["หมายเหตุ", <span key="note" className="whitespace-pre-wrap">{c.note || "-"}</span>],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-ink">
          เคส #{formatCaseNo(c)}: {c.title}
        </h1>
        <CaseStatusBadge status={c.status} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Link
            href={`/admin/cases/${c.id}/edit`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            แก้ไข
          </Link>
          <DeleteCaseButton title={c.title} action={deleteCase.bind(null, c.id)} />
          <Link href="/admin/cases" className="rounded-lg bg-surface-muted px-4 py-2 text-sm text-ink-muted hover:bg-surface-muted">
            ← กลับ
          </Link>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-ink">เปลี่ยนสถานะเคส</h2>
        <CaseStatusForm
          currentStatus={c.status}
          action={updateCaseStatus.bind(null, c.id)}
        />
      </section>

      <dl className="card grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 p-5 text-sm sm:grid-cols-[160px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-subtle">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-ink">เพิ่มบันทึก</h2>
        <form action={addCaseNote.bind(null, c.id)} className="flex flex-wrap items-start gap-2">
          <textarea
            name="detail"
            rows={2}
            required
            placeholder="บันทึกการดำเนินการ เช่น ตรวจสอบแล้ว, รออะไหล่, แก้ไขเสร็จ..."
            className={`${inputCls} min-w-[240px] flex-1`}
          />
          <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">
            บันทึก
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-ink">ประวัติเคส</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-ink-subtle">ไม่มีประวัติ</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs text-ink-subtle">
                <th className="py-2 pr-4">วันที่</th>
                <th className="py-2">รายการ</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-hairline align-top last:border-0">
                  <td className="whitespace-nowrap py-2 pr-4 text-ink-subtle">{l.created_at}</td>
                  <td className="py-2">
                    <span className="font-medium">{l.action}</span>
                    {l.detail && (
                      <div className="whitespace-pre-wrap text-xs text-ink-subtle">{l.detail}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
