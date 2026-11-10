"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, addLog, addCaseLog, type Asset, type Case } from "./db";
import { checkCredentials, sessionToken, requireLogin, SESSION_COOKIE } from "./auth";
import {
  ASSET_STATUSES,
  CASE_TYPES,
  CASE_STATUSES,
  CASE_PRIORITIES,
  teamForCaseType,
} from "./constants";
import { insertCase } from "./cases";
import { safeAdminReturn } from "./safe-return";

// ---------- auth ----------
export type LoginState = { error?: string };

function safeAdminDest(next: string) {
  const path = next.trim();
  if (path === "/admin" || path === "/admin/") return "/admin/overview";
  if (path.startsWith("/admin/") || path.startsWith("/admin?")) return path;
  return "/admin/overview";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const user = String(formData.get("username") ?? "");
  const pass = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();
  if (!checkCredentials(user, pass)) {
    return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  redirect(safeAdminDest(next));
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

// ---------- assets ----------
const ASSET_FIELDS = [
  "asset_code", "category", "brand", "model", "serial_no", "spec",
  "start_date", "holder", "department", "location", "phone", "status", "note",
] as const;

function assetValues(formData: FormData): Record<string, string> {
  const v: Record<string, string> = {};
  for (const f of ASSET_FIELDS) v[f] = String(formData.get(f) ?? "").trim();
  v.shared_use = formData.get("shared_use") === "1" ? "1" : "0";
  if (v.shared_use === "1") v.holder = "";
  return v;
}

export async function createAsset(formData: FormData) {
  await requireLogin();
  const v = assetValues(formData);
  if (!v.asset_code) return;
  const result = db.prepare(
    `INSERT INTO assets (${ASSET_FIELDS.join(",")}, shared_use) VALUES (${ASSET_FIELDS.map(() => "?").join(",")}, ?)`
  ).run(...ASSET_FIELDS.map((f) => v[f]), Number(v.shared_use));
  const id = Number(result.lastInsertRowid);
  const owner = v.shared_use === "1" ? v.department || "-" : v.holder || "-";
  addLog(id, "เพิ่มอุปกรณ์", `ผู้ถือครอง: ${owner}`);
  revalidatePath("/admin");
  const returnTo = safeAdminReturn(String(formData.get("return_to") ?? ""), `/admin/assets/${id}`);
  redirect(returnTo);
}

export async function updateAsset(id: number, formData: FormData) {
  await requireLogin();
  const old = db.prepare("SELECT * FROM assets WHERE id = ?").get(id) as Asset | undefined;
  if (!old) redirect("/admin/assets");
  const v = assetValues(formData);
  if (!v.asset_code) return;
  if (v.holder !== old.holder && old.shared_use !== 1) {
    addLog(id, "เปลี่ยนผู้ถือครอง", `${old.holder || "-"} → ${v.holder || "-"}`);
  }
  if (v.department !== old.department) {
    const label =
      old.shared_use === 1 || v.shared_use === "1"
        ? "เปลี่ยนแผนก (ใช้ร่วมกัน)"
        : "เปลี่ยนแผนก";
    addLog(id, label, `${old.department || "-"} → ${v.department || "-"}`);
  }
  if (Number(v.shared_use) !== old.shared_use) {
    addLog(
      id,
      "เปลี่ยนประเภทการใช้งาน",
      old.shared_use === 1 ? "ใช้ร่วมกัน → บุคคล" : "บุคคล → ใช้ร่วมกัน"
    );
  }
  if (v.location !== old.location) {
    addLog(id, "เปลี่ยนสถานที่", `${old.location || "-"} → ${v.location || "-"}`);
  }
  if (v.status !== old.status) {
    addLog(id, "เปลี่ยนสถานะ", `${old.status} → ${v.status}`);
  }
  db.prepare(
    `UPDATE assets SET ${ASSET_FIELDS.map((f) => `${f}=?`).join(",")}, shared_use=? WHERE id=?`
  ).run(...ASSET_FIELDS.map((f) => v[f]), Number(v.shared_use), id);
  revalidatePath("/admin");
  const returnTo = safeAdminReturn(String(formData.get("return_to") ?? ""), `/admin/assets/${id}`);
  redirect(returnTo);
}

export async function deleteAsset(id: number) {
  await requireLogin();
  db.prepare("DELETE FROM asset_logs WHERE asset_id = ?").run(id);
  db.prepare("DELETE FROM assets WHERE id = ?").run(id);
  revalidatePath("/admin");
  redirect("/admin/assets");
}

export async function addAssetLog(id: number, formData: FormData) {
  await requireLogin();
  const action = String(formData.get("action") ?? "อื่นๆ");
  const detail = String(formData.get("detail") ?? "").trim();
  const cost = Number(formData.get("cost") ?? 0) || 0;
  addLog(id, action, detail, cost);
  revalidatePath(`/admin/assets/${id}`);
  revalidatePath("/admin/history");
}

export async function updateAssetStatus(id: number, formData: FormData) {
  await requireLogin();
  const status = String(formData.get("status") ?? "").trim();
  if (!ASSET_STATUSES.includes(status as (typeof ASSET_STATUSES)[number])) return;
  const old = db.prepare("SELECT * FROM assets WHERE id = ?").get(id) as Asset | undefined;
  if (!old || old.status === status) return;
  db.prepare("UPDATE assets SET status = ? WHERE id = ?").run(status, id);
  addLog(id, "เปลี่ยนสถานะ", `${old.status} → ${status}`);
  revalidatePath("/admin");
}

/** โอนย้ายผู้ถือครอง — บันทึกประวัติแยก ไม่กระทบ log ซ่อมเดิม */
export async function transferAssetHolder(id: number, formData: FormData) {
  await requireLogin();
  const old = db.prepare("SELECT * FROM assets WHERE id = ?").get(id) as Asset | undefined;
  if (!old) redirect("/admin/assets");

  const holder = String(formData.get("holder") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const isShared = old.shared_use === 1;

  const changes: string[] = [];
  if (!isShared && holder !== old.holder) {
    changes.push(`ผู้ถือครอง: ${old.holder || "-"} → ${holder || "-"}`);
  }
  if (department !== old.department) {
    changes.push(
      isShared
        ? `แผนก (ใช้ร่วมกัน): ${old.department || "-"} → ${department || "-"}`
        : `แผนก: ${old.department || "-"} → ${department || "-"}`
    );
  }
  if (location !== old.location) changes.push(`สถานที่: ${old.location || "-"} → ${location || "-"}`);
  if (changes.length === 0) return;

  db.prepare("UPDATE assets SET holder=?, department=?, location=? WHERE id=?").run(
    isShared ? "" : holder, department, location, id
  );
  const detail = note ? `${changes.join(" · ")}\nหมายเหตุ: ${note}` : changes.join(" · ");
  addLog(id, "โอนย้ายผู้ถือครอง", detail);
  revalidatePath("/admin");
}

// ---------- licenses ----------
const LICENSE_FIELDS = [
  "name", "category", "vendor", "seats", "account", "expire_date", "status", "note",
] as const;

function licenseValues(formData: FormData) {
  const v: Record<string, string | number> = {};
  for (const f of LICENSE_FIELDS) v[f] = String(formData.get(f) ?? "").trim();
  v.cost = Number(formData.get("cost") ?? 0) || 0;
  return v;
}

export async function createLicense(formData: FormData) {
  await requireLogin();
  const v = licenseValues(formData);
  if (!v.name) return;
  db.prepare(
    `INSERT INTO licenses (${LICENSE_FIELDS.join(",")}, cost)
     VALUES (${LICENSE_FIELDS.map(() => "?").join(",")}, ?)`
  ).run(...LICENSE_FIELDS.map((f) => v[f]), v.cost);
  revalidatePath("/admin");
  redirect("/admin/licenses");
}

export async function updateLicense(id: number, formData: FormData) {
  await requireLogin();
  const v = licenseValues(formData);
  if (!v.name) return;
  db.prepare(
    `UPDATE licenses SET ${LICENSE_FIELDS.map((f) => `${f}=?`).join(",")}, cost=? WHERE id=?`
  ).run(...LICENSE_FIELDS.map((f) => v[f]), v.cost, id);
  revalidatePath("/admin");
  redirect("/admin/licenses");
}

export async function deleteLicense(id: number) {
  await requireLogin();
  db.prepare("DELETE FROM licenses WHERE id = ?").run(id);
  revalidatePath("/admin");
  redirect("/admin/licenses");
}

// ---------- cases ----------
const CASE_FIELDS = [
  "title", "case_type", "reported_by", "contact", "department",
  "description", "priority", "note", "case_ref",
] as const;

function caseValues(formData: FormData) {
  const v: Record<string, string> = {};
  for (const f of CASE_FIELDS) v[f] = String(formData.get(f) ?? "").trim();
  const assetId = String(formData.get("asset_id") ?? "").trim();
  v.asset_id = assetId;
  v.team = teamForCaseType(v.case_type);
  return v;
}

export async function createCase(formData: FormData) {
  await requireLogin();
  const v = caseValues(formData);
  if (!v.title || !v.reported_by) return;
  const id = insertCase({
    title: v.title,
    case_type: v.case_type,
    reported_by: v.reported_by,
    contact: v.contact,
    department: v.department,
    description: v.description,
    asset_id: v.asset_id ? Number(v.asset_id) : null,
    priority: v.priority || "ปกติ",
    note: v.note,
    source: "it",
  });
  revalidatePath("/admin");
  redirect(`/admin/cases/${id}`);
}

export async function updateCase(id: number, formData: FormData) {
  await requireLogin();
  const old = db.prepare("SELECT * FROM cases WHERE id = ?").get(id) as Case | undefined;
  if (!old) redirect("/admin/cases");
  const v = caseValues(formData);
  if (!v.title || !v.reported_by) return;
  if (!CASE_TYPES.includes(v.case_type as (typeof CASE_TYPES)[number])) {
    v.case_type = old.case_type;
    v.team = teamForCaseType(v.case_type);
  }
  const ts = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }).slice(0, 16);
  db.prepare(
    `UPDATE cases SET title=?, case_type=?, team=?, reported_by=?, contact=?,
     department=?, description=?, asset_id=?, priority=?, note=?, case_ref=?, updated_at=? WHERE id=?`
  ).run(
    v.title, v.case_type, v.team, v.reported_by, v.contact, v.department,
    v.description, v.asset_id ? Number(v.asset_id) : null,
    v.priority || "ปกติ", v.note, v.case_ref ?? "", ts, id
  );
  if (v.case_type !== old.case_type) {
    addCaseLog(id, "เปลี่ยนประเภท", `${old.case_type} → ${v.case_type} (ทีม: ${v.team})`);
  }
  revalidatePath("/admin");
  redirect(`/admin/cases/${id}`);
}

export async function updateCaseStatus(id: number, formData: FormData) {
  await requireLogin();
  const status = String(formData.get("status") ?? "").trim();
  if (!CASE_STATUSES.includes(status as (typeof CASE_STATUSES)[number])) return;
  const old = db.prepare("SELECT * FROM cases WHERE id = ?").get(id) as Case | undefined;
  if (!old || old.status === status) return;
  const ts = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }).slice(0, 16);
  const closedAt = status === "เสร็จแล้ว" || status === "ยกเลิก" ? ts : "";
  db.prepare(
    "UPDATE cases SET status = ?, updated_at = ?, closed_at = ? WHERE id = ?"
  ).run(status, ts, closedAt, id);
  addCaseLog(id, "เปลี่ยนสถานะ", `${old.status} → ${status}`);
  revalidatePath(`/admin/cases/${id}`);
  revalidatePath("/admin/cases");
  revalidatePath("/admin");
}

export async function addCaseNote(id: number, formData: FormData) {
  await requireLogin();
  const detail = String(formData.get("detail") ?? "").trim();
  if (!detail) return;
  const ts = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }).slice(0, 16);
  db.prepare("UPDATE cases SET updated_at = ? WHERE id = ?").run(ts, id);
  addCaseLog(id, "บันทึก", detail);
  revalidatePath(`/admin/cases/${id}`);
}

export async function deleteCase(id: number) {
  await requireLogin();
  db.prepare("DELETE FROM case_logs WHERE case_id = ?").run(id);
  db.prepare("DELETE FROM cases WHERE id = ?").run(id);
  revalidatePath("/admin");
  redirect("/admin/cases");
}
