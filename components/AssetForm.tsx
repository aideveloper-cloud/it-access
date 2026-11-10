import { CATEGORIES, ASSET_STATUSES } from "@/lib/constants";
import type { Asset } from "@/lib/db";
import SharedAssetFields from "./SharedAssetFields";

export default function AssetForm({
  asset,
  action,
  submitLabel,
  returnTo = "",
}: {
  asset?: Partial<Asset>;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  returnTo?: string;
}) {
  const a = asset ?? {};
  return (
    <form action={action} className="card p-6">
      {returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label">รหัสทรัพย์สิน *</label>
          <input name="asset_code" defaultValue={a.asset_code ?? ""} required className="input code-chip" />
        </div>
        <div>
          <label className="label">หมวดหมู่</label>
          <select name="category" defaultValue={a.category ?? CATEGORIES[0]} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">สถานะ</label>
          <select name="status" defaultValue={a.status ?? "ใช้งาน"} className="input">
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">ยี่ห้อ</label>
          <input name="brand" defaultValue={a.brand ?? ""} className="input" />
        </div>
        <div>
          <label className="label">รุ่น</label>
          <input name="model" defaultValue={a.model ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Serial Number</label>
          <input name="serial_no" defaultValue={a.serial_no ?? ""} className="input" />
        </div>
        <div>
          <label className="label">วันที่เปิดใช้งาน</label>
          <input type="date" name="start_date" defaultValue={a.start_date ?? ""} className="input" />
        </div>
        <SharedAssetFields
          sharedUse={a.shared_use ?? 0}
          holder={a.holder ?? ""}
          department={a.department ?? ""}
        />
        <div>
          <label className="label">สถานที่</label>
          <input name="location" defaultValue={a.location ?? ""} className="input" />
        </div>
        <div>
          <label className="label">เบอร์โทร (ถ้ามี)</label>
          <input name="phone" defaultValue={a.phone ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label">Spec</label>
          <textarea name="spec" rows={3} defaultValue={a.spec ?? ""} className="input" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label">หมายเหตุ</label>
          <textarea name="note" rows={2} defaultValue={a.note ?? ""} className="input" />
        </div>
      </div>
      <div className="mt-5">
        <button type="submit" className="btn btn-primary px-5">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
