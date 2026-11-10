import { CASE_TYPES, CASE_PRIORITIES, teamForCaseType } from "@/lib/constants";
import type { Case } from "@/lib/db";
import CaseTypeSelect from "./CaseTypeSelect";

export default function CaseForm({
  caseData,
  assets,
  action,
  submitLabel,
  showCaseRef = false,
}: {
  caseData?: Partial<Case>;
  assets: { id: number; asset_code: string; holder: string }[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  showCaseRef?: boolean;
}) {
  const c = caseData ?? {};
  const defaultType = c.case_type ?? "Support";
  const defaultTeam = c.team ?? teamForCaseType(defaultType);

  return (
    <form action={action} className="card p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {showCaseRef && (
          <div>
            <label className="label">เลขเคส (แสดง)</label>
            <input
              name="case_ref"
              defaultValue={c.case_ref ?? ""}
              className="input code-chip"
              placeholder={`ว่างไว้ใช้เลขระบบ #${c.id ?? ""}`}
            />
            <p className="mt-1 text-xs text-ink-subtle">
              แก้เลขที่แสดงได้ (เช่น IT-2026-005) — เลข id ภายใน #{c.id} เปลี่ยนไม่ได้
            </p>
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="label">หัวข้อเคส *</label>
          <input name="title" defaultValue={c.title ?? ""} required className="input" placeholder="เช่น คอมเปิดไม่ติด, ระบบ error ตอน login" />
        </div>
        <div>
          <label className="label">ประเภทเคส</label>
          <CaseTypeSelect types={CASE_TYPES} defaultType={defaultType} />
          <p className="mt-1 text-xs text-ink-subtle">
            Support → IT Support · แก้บัค/พัฒนาระบบ/อื่นๆ → Dev
          </p>
        </div>
        <div>
          <label className="label">ทีมรับผิดชอบ (อัตโนมัติ)</label>
          <input
            readOnly
            defaultValue={defaultTeam}
            className="input bg-surface-muted text-ink-muted"
            data-team-preview
          />
        </div>
        <div>
          <label className="label">รับจาก (ผู้แจ้ง) *</label>
          <input name="reported_by" defaultValue={c.reported_by ?? ""} required className="input" placeholder="ชื่อพนักงาน / แผนก" />
        </div>
        <div>
          <label className="label">เบอร์ติดต่อ</label>
          <input name="contact" defaultValue={c.contact ?? ""} className="input" placeholder="เบอร์โทร / Line" />
        </div>
        <div>
          <label className="label">แผนก</label>
          <input name="department" defaultValue={c.department ?? ""} className="input" />
        </div>
        <div>
          <label className="label">ความเร่งด่วน</label>
          <select name="priority" defaultValue={c.priority ?? "ปกติ"} className="input">
            {CASE_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">อุปกรณ์ที่เกี่ยวข้อง (ถ้ามี)</label>
          <select name="asset_id" defaultValue={c.asset_id?.toString() ?? ""} className="input">
            <option value="">— ไม่ระบุ —</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.asset_code}{a.holder ? ` (${a.holder})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">รายละเอียดปัญหา</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={c.description ?? ""}
            className="input"
            placeholder="อาการ / ขั้นตอนที่ทำให้เกิด / ข้อความ error..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">หมายเหตุเพิ่มเติม</label>
          <textarea name="note" rows={2} defaultValue={c.note ?? ""} className="input" />
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
