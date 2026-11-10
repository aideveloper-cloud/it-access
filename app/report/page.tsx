import EmployeeCaseForm from "@/components/EmployeeCaseForm";
import { reportCase } from "@/lib/report-actions";

export default function ReportPage() {
  return (
    <div className="space-y-6">
      <div className="card p-6 sm:p-8">
        <h1 className="page-title">แจ้งปัญหา IT</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          กรอกแบบฟอร์มด้านล่าง ทีม IT จะรับเคสและติดต่อกลับตามลำดับ
          หลังส่งแล้วจะได้เลขเคสไว้ตรวจสอบสถานะ
        </p>
      </div>

      <div className="card p-6 sm:p-8">
        <EmployeeCaseForm action={reportCase} />
      </div>
    </div>
  );
}
