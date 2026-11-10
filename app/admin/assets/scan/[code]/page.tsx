import { redirect, notFound } from "next/navigation";
import { requireLogin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** สแกน Barcode/QR จาก label → เปิดหน้าอุปกรณ์ (ข้อมูลผู้ถือครองล่าสุด) */
export default async function AssetScanPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await requireLogin();
  const { code } = await params;
  const asset = db
    .prepare("SELECT id FROM assets WHERE asset_code = ? COLLATE NOCASE")
    .get(decodeURIComponent(code)) as { id: number } | undefined;
  if (!asset) notFound();
  redirect(`/admin/assets/${asset.id}`);
}
