"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { insertCase, resolveAssetId } from "./cases";
import { CASE_TYPES } from "./constants";

export type ReportCaseState = { error?: string };

export async function reportCase(_prev: ReportCaseState, formData: FormData): Promise<ReportCaseState> {
  const title = String(formData.get("title") ?? "").trim();
  const reportedBy = String(formData.get("reported_by") ?? "").trim();
  if (!title || !reportedBy) {
    return { error: "กรุณากรอกชื่อผู้แจ้งและหัวข้อปัญหา" };
  }

  let caseType = String(formData.get("case_type") ?? "Support").trim();
  if (!CASE_TYPES.includes(caseType as (typeof CASE_TYPES)[number])) {
    caseType = "Support";
  }

  const assetCode = String(formData.get("asset_code") ?? "").trim();
  const id = insertCase({
    title,
    case_type: caseType,
    reported_by: reportedBy,
    contact: String(formData.get("contact") ?? "").trim(),
    department: String(formData.get("department") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    asset_id: resolveAssetId(assetCode),
    source: "employee",
  });

  revalidatePath("/admin");
  redirect(`/report/success?id=${id}`);
}

export type CaseLookup = {
  id: number;
  title: string;
  status: string;
  team: string;
  created_at: string;
  updated_at: string;
};

export async function lookupCase(id: number, reportedBy: string): Promise<CaseLookup | null> {
  if (!id || !reportedBy.trim()) return null;
  const row = db
    .prepare(
      "SELECT id, title, status, team, created_at, updated_at FROM cases WHERE id = ? AND reported_by = ?"
    )
    .get(id, reportedBy.trim()) as CaseLookup | undefined;
  return row ?? null;
}
