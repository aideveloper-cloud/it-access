import Link from "next/link";

export const metadata = {
  title: "แจ้งปัญหา IT — KGarden",
  description: "แจ้งปัญหา IT สำหรับพนักงาน",
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-hairline bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/report" className="group">
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-subtle">
              KGarden IT
            </div>
            <div className="text-[15px] font-semibold tracking-tight text-ink group-hover:text-accent">
              แจ้งปัญหา
            </div>
          </Link>
          <Link
            href="/report/status"
            className="text-[13px] font-medium text-ink-muted transition-colors hover:text-accent"
          >
            ตรวจสอบสถานะ
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}
