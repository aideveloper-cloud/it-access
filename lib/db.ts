import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "itsupport.db");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const BACKUP_KEEP = 14;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_code TEXT NOT NULL,
    category TEXT NOT NULL,
    brand TEXT DEFAULT '',
    model TEXT DEFAULT '',
    serial_no TEXT DEFAULT '',
    spec TEXT DEFAULT '',
    start_date TEXT DEFAULT '',
    holder TEXT DEFAULT '',
    department TEXT DEFAULT '',
    location TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    status TEXT DEFAULT 'ใช้งาน',
    note TEXT DEFAULT '',
    shared_use INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS asset_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    action TEXT NOT NULL,
    detail TEXT DEFAULT '',
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'อื่นๆ',
    vendor TEXT DEFAULT '',
    seats TEXT DEFAULT '',
    account TEXT DEFAULT '',
    expire_date TEXT DEFAULT '',
    cost REAL DEFAULT 0,
    status TEXT DEFAULT 'ใช้งาน',
    note TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    case_type TEXT NOT NULL,
    team TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    contact TEXT DEFAULT '',
    department TEXT DEFAULT '',
    description TEXT DEFAULT '',
    asset_id INTEGER,
    status TEXT DEFAULT 'รอรับ',
    priority TEXT DEFAULT 'ปกติ',
    note TEXT DEFAULT '',
    source TEXT DEFAULT 'employee',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    closed_at TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS case_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL REFERENCES cases(id),
    action TEXT NOT NULL,
    detail TEXT DEFAULT '',
    created_at TEXT NOT NULL
);
`;

/** สำรองไฟล์ DB วันละครั้ง เก็บย้อนหลัง BACKUP_KEEP ไฟล์ — เรียกก่อนเปิด DB */
function dailyBackup() {
  if (!fs.existsSync(DB_PATH)) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
  const dest = path.join(BACKUP_DIR, `itsupport-${today}.db`);
  if (fs.existsSync(dest)) return;
  fs.copyFileSync(DB_PATH, dest);
  const old = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith("itsupport-") && f.endsWith(".db"))
    .sort()
    .slice(0, -BACKUP_KEEP);
  for (const f of old) fs.unlinkSync(path.join(BACKUP_DIR, f));
}

/** เช็คว่ามีตารางใน DB หรือยัง */
function tableExists(db: DatabaseSync, name: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(name) as { name: string } | undefined;
  return !!row;
}

/** เพิ่มคอลัมน์/ตารางใหม่ให้ DB เก่าโดยไม่ทำข้อมูลหาย */
function migrate(db: DatabaseSync) {
  if (tableExists(db, "asset_logs")) {
    const logCols = db.prepare("PRAGMA table_info(asset_logs)").all() as { name: string }[];
    if (!logCols.some((c) => c.name === "cost")) {
      db.exec("ALTER TABLE asset_logs ADD COLUMN cost REAL DEFAULT 0");
    }
  }

  if (!tableExists(db, "cases")) {
    db.exec(`
      CREATE TABLE cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        case_type TEXT NOT NULL,
        team TEXT NOT NULL,
        reported_by TEXT NOT NULL,
        contact TEXT DEFAULT '',
        department TEXT DEFAULT '',
        description TEXT DEFAULT '',
        asset_id INTEGER,
        status TEXT DEFAULT 'รอรับ',
        priority TEXT DEFAULT 'ปกติ',
        note TEXT DEFAULT '',
        source TEXT DEFAULT 'employee',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        closed_at TEXT DEFAULT ''
      );
    `);
  }

  if (!tableExists(db, "case_logs")) {
    db.exec(`
      CREATE TABLE case_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        case_id INTEGER NOT NULL REFERENCES cases(id),
        action TEXT NOT NULL,
        detail TEXT DEFAULT '',
        created_at TEXT NOT NULL
      );
    `);
  }

  if (tableExists(db, "assets")) {
    const assetCols = db.prepare("PRAGMA table_info(assets)").all() as { name: string }[];
    if (!assetCols.some((c) => c.name === "shared_use")) {
      db.exec("ALTER TABLE assets ADD COLUMN shared_use INTEGER DEFAULT 0");
    }
  }

  if (tableExists(db, "cases")) {
    const caseCols = db.prepare("PRAGMA table_info(cases)").all() as { name: string }[];
    if (!caseCols.some((c) => c.name === "source")) {
      db.exec("ALTER TABLE cases ADD COLUMN source TEXT DEFAULT 'employee'");
    }
    if (!caseCols.some((c) => c.name === "case_ref")) {
      db.exec("ALTER TABLE cases ADD COLUMN case_ref TEXT DEFAULT ''");
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __itdb: DatabaseSync | undefined;
}

function open(): DatabaseSync {
  dailyBackup();
  const db = new DatabaseSync(DB_PATH);
  db.exec(SCHEMA);
  migrate(db);
  return db;
}

function getDb(): DatabaseSync {
  if (!globalThis.__itdb) {
    globalThis.__itdb = open();
  } else {
    migrate(globalThis.__itdb);
  }
  return globalThis.__itdb;
}

export const db: DatabaseSync = getDb();

export type Asset = {
  id: number;
  asset_code: string;
  category: string;
  brand: string;
  model: string;
  serial_no: string;
  spec: string;
  start_date: string;
  holder: string;
  department: string;
  location: string;
  phone: string;
  status: string;
  note: string;
  shared_use: number;
};

/** ชื่อผู้ใช้งานที่แสดง — ใช้ร่วมกัน = แผนก, ปกติ = ผู้ถือครอง */
export function assetOwnerLabel(asset: Pick<Asset, "shared_use" | "holder" | "department">): string {
  if (asset.shared_use === 1) return asset.department || "— ว่าง —";
  return asset.holder || "— ว่าง —";
}

export type AssetLog = {
  id: number;
  asset_id: number;
  action: string;
  detail: string;
  cost: number;
  created_at: string;
  asset_code?: string;
};

export type License = {
  id: number;
  name: string;
  category: string;
  vendor: string;
  seats: string;
  account: string;
  expire_date: string;
  cost: number;
  status: string;
  note: string;
};

export type Case = {
  id: number;
  case_ref: string;
  title: string;
  case_type: string;
  team: string;
  reported_by: string;
  contact: string;
  department: string;
  description: string;
  asset_id: number | null;
  status: string;
  priority: string;
  note: string;
  source: string;
  created_at: string;
  updated_at: string;
  closed_at: string;
  asset_code?: string;
};

export type CaseLog = {
  id: number;
  case_id: number;
  action: string;
  detail: string;
  created_at: string;
};

/** จำนวนวันจนถึงวันหมดอายุ (ติดลบ = หมดแล้ว), null ถ้าไม่มีวันหมดอายุ */
export function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr.slice(0, 10));
  if (isNaN(d.getTime())) return null;
  const today = new Date(new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" }));
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function now(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Bangkok" }).slice(0, 16);
}

export function addLog(assetId: number, action: string, detail = "", cost = 0) {
  db.prepare(
    "INSERT INTO asset_logs (asset_id, action, detail, cost, created_at) VALUES (?,?,?,?,?)"
  ).run(assetId, action, detail, cost, now());
}

export function addCaseLog(caseId: number, action: string, detail = "") {
  db.prepare(
    "INSERT INTO case_logs (case_id, action, detail, created_at) VALUES (?,?,?,?)"
  ).run(caseId, action, detail, now());
}

/** อายุการใช้งานเป็นข้อความ เช่น "3 ปี 5 เดือน" */
export function assetAge(startDate: string): string {
  if (!startDate) return "";
  const d = new Date(startDate.slice(0, 10));
  if (isNaN(d.getTime())) return "";
  const today = new Date();
  let months = (today.getFullYear() - d.getFullYear()) * 12 + today.getMonth() - d.getMonth();
  if (today.getDate() < d.getDate()) months -= 1;
  if (months < 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} ปี`);
  if (m || !y) parts.push(`${m} เดือน`);
  return parts.join(" ");
}
