import { createAsset } from "@/lib/actions";
import { safeAdminReturn } from "@/lib/safe-return";
import AssetForm from "@/components/AssetForm";

export const metadata = { title: "เพิ่มอุปกรณ์ — KGarden IT Asset" };

export default async function NewAssetPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from = "" } = await searchParams;
  const returnTo = safeAdminReturn(from, "/admin/assets");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">เพิ่มอุปกรณ์</h1>
      <AssetForm action={createAsset} submitLabel="เพิ่มอุปกรณ์" returnTo={returnTo} />
    </div>
  );
}
