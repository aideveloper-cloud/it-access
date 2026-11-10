import { notFound } from "next/navigation";
import { db, type License } from "@/lib/db";
import { updateLicense, deleteLicense } from "@/lib/actions";
import LicenseForm from "@/components/LicenseForm";
import DeleteAssetButton from "@/components/DeleteAssetButton";

export const metadata = { title: "แก้ไข License — KGarden IT Asset" };
export const dynamic = "force-dynamic";

export default async function EditLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const license = db.prepare("SELECT * FROM licenses WHERE id = ?").get(Number(id)) as
    | License
    | undefined;
  if (!license) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-ink">
          แก้ไข License <span className="text-sm font-normal text-ink-subtle">· {license.name}</span>
        </h1>
        <div className="ml-auto">
          <DeleteAssetButton assetCode={license.name} action={deleteLicense.bind(null, license.id)} />
        </div>
      </div>
      <LicenseForm license={license} action={updateLicense.bind(null, license.id)} submitLabel="บันทึก" />
    </div>
  );
}
