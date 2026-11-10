import type { Case } from "./db";

/** เลขเคสที่แสดง — แก้ `case_ref` ได้ในเมนูแก้ไขเคส (เลข id ภายในเปลี่ยนไม่ได้) */
export function formatCaseNo(c: Pick<Case, "id" | "case_ref">): string {
  const ref = (c.case_ref ?? "").trim();
  return ref || String(c.id);
}
