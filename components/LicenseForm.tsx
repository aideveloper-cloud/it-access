import { LICENSE_CATEGORIES, LICENSE_STATUSES } from "@/lib/constants";
import type { License } from "@/lib/db";

export default function LicenseForm({
  license,
  action,
  submitLabel,
}: {
  license?: Partial<License>;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const l = license ?? {};
  return (
    <form action={action} className="card p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label">ชื่อ License / บริการ *</label>
          <input name="name" defaultValue={l.name ?? ""} required className="input"
            placeholder="เช่น Microsoft 365, โดเมน kgarden.co.th" />
        </div>
        <div>
          <label className="label">หมวดหมู่</label>
          <select name="category" defaultValue={l.category ?? LICENSE_CATEGORIES[0]} className="input">
            {LICENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">สถานะ</label>
          <select name="status" defaultValue={l.status ?? "ใช้งาน"} className="input">
            {LICENSE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">ผู้ให้บริการ / Vendor</label>
          <input name="vendor" defaultValue={l.vendor ?? ""} className="input" />
        </div>
        <div>
          <label className="label">จำนวน (seats / เครื่อง)</label>
          <input name="seats" defaultValue={l.seats ?? ""} className="input" />
        </div>
        <div>
          <label className="label">บัญชีที่ผูกไว้</label>
          <input name="account" defaultValue={l.account ?? ""} className="input"
            placeholder="เช่น it@kgarden.co.th" />
        </div>
        <div>
          <label className="label">วันหมดอายุ / ต่ออายุ</label>
          <input type="date" name="expire_date" defaultValue={l.expire_date ?? ""} className="input" />
        </div>
        <div>
          <label className="label">ค่าใช้จ่ายต่อรอบ (บาท)</label>
          <input type="number" name="cost" min="0" step="0.01" defaultValue={l.cost || ""} className="input" />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className="label">หมายเหตุ</label>
          <textarea name="note" rows={2} defaultValue={l.note ?? ""} className="input" />
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
