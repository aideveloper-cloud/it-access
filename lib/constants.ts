export const CATEGORIES = [
  "โทรศัพท์", "Notebook", "Monitor", "Printer/Scanner",
  "อุปกรณ์ Meeting", "UPS", "Computer", "Network", "NVR/CCTV", "อื่นๆ",
] as const;

export const ASSET_STATUSES = [
  "ใช้งาน", "ว่าง", "ส่งซ่อม", "ใช้งานไม่ได้", "จำหน่ายแล้ว",
] as const;

export const LOG_ACTIONS = [
  "ซ่อม", "เปลี่ยนอะไหล่", "ตรวจเช็ค", "ลงโปรแกรม/ตั้งค่า", "อื่นๆ",
] as const;

export const STATUS_STYLES: Record<string, string> = {
  "ใช้งาน": "bg-accent-soft text-accent",
  "ว่าง": "bg-info/10 text-info",
  "ส่งซ่อม": "bg-warning/10 text-warning",
  "ใช้งานไม่ได้": "bg-danger/10 text-danger",
  "จำหน่ายแล้ว": "bg-surface-muted text-ink-subtle",
};

export const AGING_YEARS = 4;

export const LICENSE_CATEGORIES = [
  "OS / Windows", "Office / Email", "Antivirus / Security",
  "Domain / SSL / Hosting", "ซอฟต์แวร์อื่นๆ", "อื่นๆ",
] as const;

export const LICENSE_STATUSES = ["ใช้งาน", "ยกเลิกแล้ว"] as const;

/** แจ้งเตือน license ที่จะหมดอายุภายในกี่วัน */
export const LICENSE_WARN_DAYS = 60;

export function formatBaht(n: number): string {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

// ---------- cases ----------
export const CASE_TYPES = ["Support", "แก้บัค", "พัฒนาระบบ", "อื่นๆ"] as const;

export const CASE_STATUSES = ["รอรับ", "กำลังดำเนินการ", "รอข้อมูล", "เสร็จแล้ว", "ยกเลิก"] as const;

export const CASE_PRIORITIES = ["ปกติ", "ด่วน", "ด่วนมาก"] as const;

export const CASE_TEAMS = ["IT Support", "Dev"] as const;

/** Support → IT Support, อื่นๆ → Dev */
export function teamForCaseType(type: string): (typeof CASE_TEAMS)[number] {
  return type === "Support" ? "IT Support" : "Dev";
}

export const CASE_STATUS_STYLES: Record<string, string> = {
  "รอรับ": "bg-warning/10 text-warning",
  "กำลังดำเนินการ": "bg-info/10 text-info",
  "รอข้อมูล": "bg-surface-muted text-ink-muted",
  "เสร็จแล้ว": "bg-accent-soft text-accent",
  "ยกเลิก": "bg-surface-muted text-ink-subtle",
};

export const CASE_TEAM_STYLES: Record<string, string> = {
  "IT Support": "bg-info/10 text-info",
  "Dev": "bg-accent-soft text-accent",
};

export const CASE_PRIORITY_STYLES: Record<string, string> = {
  "ปกติ": "bg-surface-muted text-ink-muted",
  "ด่วน": "bg-warning/10 text-warning",
  "ด่วนมาก": "bg-danger/10 text-danger",
};

/** ประเภทเคสที่พนักงานเลือกได้ */
export const EMPLOYEE_CASE_TYPES = [
  { value: "Support", label: "ขอความช่วยเหลือ IT (คอม, เน็ต, อีเมล, อุปกรณ์)" },
  { value: "แก้บัค", label: "ระบบ/โปรแกรมมีบัค หรือใช้งานผิดปกติ" },
  { value: "พัฒนาระบบ", label: "ขอพัฒนาฟีเจอร์ใหม่" },
  { value: "อื่นๆ", label: "อื่นๆ" },
] as const;

export const CASE_SOURCE_LABELS: Record<string, string> = {
  employee: "พนักงานแจ้ง",
  it: "ทีม IT รับ",
};
