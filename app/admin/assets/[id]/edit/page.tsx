import { notFound } from "next/navigation";
import { db, type Asset } from "@/lib/db";
import { updateAsset } from "@/lib/actions";
import { safeAdminReturn } from "@/lib/safe-return";
import AssetForm from "@/components/AssetForm";

export const metadata = { title: "แก้ไขอุปกรณ์ — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default async function EditAssetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from = "" } = await searchParams;
  const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(Number(id)) as
    | Asset
    | undefined;
  if (!asset) notFound();

  const returnTo = safeAdminReturn(from, `/admin/assets/${asset.id}`);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">
        แก้ไขอุปกรณ์ <span className="text-sm font-normal text-ink-subtle">· {asset.asset_code}</span>
      </h1>
      <AssetForm
        asset={asset}
        action={updateAsset.bind(null, asset.id)}
        submitLabel="บันทึก"
        returnTo={returnTo}
      />
    </div>
  );
}
