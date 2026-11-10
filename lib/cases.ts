import { db, addCaseLog, now } from "./db";
import { CASE_TYPES, teamForCaseType } from "./constants";

export type CaseSource = "employee" | "it";

export type InsertCaseInput = {
  title: string;
  case_type: string;
  reported_by: string;
  contact?: string;
  department?: string;
  description?: string;
  asset_id?: number | null;
  priority?: string;
  note?: string;
  source: CaseSource;
};

export function resolveAssetId(assetCode: string): number | null {
  const code = assetCode.trim();
  if (!code) return null;
  const row = db
    .prepare("SELECT id FROM assets WHERE asset_code = ? COLLATE NOCASE")
    .get(code) as { id: number } | undefined;
  return row?.id ?? null;
}

export function insertCase(input: InsertCaseInput): number {
  let caseType = input.case_type;
  if (!CASE_TYPES.includes(caseType as (typeof CASE_TYPES)[number])) {
    caseType = "Support";
  }
  const team = teamForCaseType(caseType);
  const ts = now();
  const result = db.prepare(
    `INSERT INTO cases (title, case_type, team, reported_by, contact, department,
      description, asset_id, status, priority, note, source, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    input.title,
    caseType,
    team,
    input.reported_by,
    input.contact ?? "",
    input.department ?? "",
    input.description ?? "",
    input.asset_id ?? null,
    "รอรับ",
    input.priority ?? "ปกติ",
    input.note ?? "",
    input.source,
    ts,
    ts
  );
  const id = Number(result.lastInsertRowid);
  const via = input.source === "employee" ? "พนักงานแจ้ง" : "ทีม IT รับ";
  addCaseLog(id, "แจ้งเคส", `${via}: ${input.reported_by} · ทีม: ${team}`);
  return id;
}
