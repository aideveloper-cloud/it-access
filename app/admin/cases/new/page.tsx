import Link from "next/link";
import { db } from "@/lib/db";
import { createCase } from "@/lib/actions";
import CaseForm from "@/components/CaseForm";

export const metadata = { title: "รับเคส (โทร/ไลน์) — KGarden IT Asset" };

export default function NewCasePage() {
  const assets = db
    .prepare("SELECT id, asset_code, holder FROM assets WHERE status != 'จำหน่ายแล้ว' ORDER BY asset_code")
    .all() as { id: number; asset_code: string; holder: string }[];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-ink">รับเคส (โทร/ไลน์)</h1>
        <Link href="/admin/cases" className="ml-auto text-sm text-accent hover:underline">
          ← กลับหน้ารับเคส
        </Link>
      </div>
      <p className="text-sm text-ink-subtle">
        ใช้เมื่อรับเคสทางโทรศัพท์หรือ Line โดยตรง — พนักงานแจ้งเองผ่าน{" "}
        <a href="/report" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          /report
        </a>
      </p>
      <CaseForm assets={assets} action={createCase} submitLabel="บันทึกเคส" />
    </div>
  );
}
