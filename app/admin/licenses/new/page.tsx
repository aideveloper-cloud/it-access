import { createLicense } from "@/lib/actions";
import LicenseForm from "@/components/LicenseForm";

export const metadata = { title: "เพิ่ม License — KGarden IT Asset" };

export default function NewLicensePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">เพิ่ม License / บริการ</h1>
      <LicenseForm action={createLicense} submitLabel="เพิ่ม License" />
    </div>
  );
}
