import Link from "next/link";
import { notFound } from "next/navigation";
import { db, type Case } from "@/lib/db";
import { updateCase } from "@/lib/actions";
import { formatCaseNo } from "@/lib/case-display";
import CaseForm from "@/components/CaseForm";

export const dynamic = "force-dynamic";

export default async function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = db.prepare("SELECT * FROM cases WHERE id = ?").get(Number(id)) as Case | undefined;
  if (!c) notFound();

  const assets = db
    .prepare("SELECT id, asset_code, holder FROM assets WHERE status != 'จำหน่ายแล้ว' ORDER BY asset_code")
    .all() as { id: number; asset_code: string; holder: string }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-ink">แก้ไขเคส #{formatCaseNo(c)}</h1>
        <Link href={`/admin/cases/${c.id}`} className="ml-auto text-sm text-accent hover:underline">
          ← กลับ
        </Link>
      </div>
      <CaseForm
        caseData={c}
        assets={assets}
        action={updateCase.bind(null, c.id)}
        submitLabel="บันทึกการแก้ไข"
        showCaseRef
      />
    </div>
  );
}
