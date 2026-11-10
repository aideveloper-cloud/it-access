import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { db, type Asset } from "@/lib/db";
import { assetScanUrl } from "@/lib/asset-url";
import AssetLabelSheet from "@/components/AssetLabelSheet";

export const dynamic = "force-dynamic";

export default async function AssetLabelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(Number(id)) as Asset | undefined;
  if (!asset) notFound();

  const scanUrl = assetScanUrl(asset.asset_code);
  const qrDataUrl = await QRCode.toDataURL(scanUrl, { margin: 1, width: 120 });

  return (
    <div className="label-print-root space-y-4">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <h1 className="text-xl font-bold text-ink">Label — {asset.asset_code}</h1>
        <Link href={`/admin/assets/${asset.id}`} className="ml-auto text-sm text-accent hover:underline">
          ← กลับรายละเอียด
        </Link>
      </div>
      <p className="text-sm text-ink-subtle print:hidden">
        เลือก Barcode หรือ QR แล้วกดพิมพ์ที่เลือก — สแกนแล้วเปิดหน้าอุปกรณ์ (ต้อง login ทีม IT)
      </p>
      <AssetLabelSheet
        labels={[
          {
            id: asset.id,
            asset_code: asset.asset_code,
            qrDataUrl,
          },
        ]}
      />
    </div>
  );
}
