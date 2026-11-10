/** กลับหน้า admin ที่ปลอดภัยหลังบันทึกฟอร์ม */
export function safeAdminReturn(path: string, fallback: string): string {
  const p = path.trim();
  if (!p.startsWith("/admin")) return fallback;
  if (p.includes("://") || p.startsWith("//")) return fallback;
  return p;
}
