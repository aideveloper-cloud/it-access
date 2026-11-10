"use client";

import { useActionState } from "react";
import { EMPLOYEE_CASE_TYPES } from "@/lib/constants";
import type { ReportCaseState } from "@/lib/report-actions";

export default function EmployeeCaseForm({
  action,
}: {
  action: (prev: ReportCaseState, formData: FormData) => Promise<ReportCaseState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reported_by" className="label">ชื่อ-นามสกุล *</label>
          <input id="reported_by" name="reported_by" required className="input" placeholder="ชื่อผู้แจ้ง" />
        </div>
        <div>
          <label htmlFor="department" className="label">แผนก</label>
          <input id="department" name="department" className="input" placeholder="เช่น บัญชี, การตลาด" />
        </div>
        <div>
          <label htmlFor="contact" className="label">เบอร์ติดต่อ</label>
          <input id="contact" name="contact" className="input" placeholder="เบอร์โทร / Line" />
        </div>
        <div>
          <label htmlFor="asset_code" className="label">รหัสอุปกรณ์ (ถ้ารู้)</label>
          <input id="asset_code" name="asset_code" className="input code-chip" placeholder="เช่น NB-001" />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="label">หัวข้อปัญหา *</label>
        <input
          id="title"
          name="title"
          required
          className="input"
          placeholder="เช่น คอมเปิดไม่ติด, อีเมลส่งไม่ออก"
        />
      </div>

      <div>
        <label htmlFor="case_type" className="label">ประเภทปัญหา</label>
        <select id="case_type" name="case_type" defaultValue="Support" className="input">
          {EMPLOYEE_CASE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-ink-subtle">
          ปัญหาทั่วไป → ทีม IT Support · บัค/พัฒนาระบบ → ทีม Dev
        </p>
      </div>

      <div>
        <label htmlFor="description" className="label">รายละเอียด</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className="input"
          placeholder="อธิบายอาการ ขั้นตอนที่ทำให้เกิด หรือข้อความ error..."
        />
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary px-5 py-2.5">
        {pending ? "กำลังส่ง..." : "ส่งแจ้งปัญหา"}
      </button>
    </form>
  );
}
