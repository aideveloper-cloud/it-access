import Link from "next/link";
import { requireLogin } from "@/lib/auth";
import { logout } from "@/lib/actions";
import { db } from "@/lib/db";

const NAV = [
  { href: "/admin/overview", label: "ภาพรวม" },
  { href: "/admin/cases", label: "รับเคส" },
  { href: "/admin/assets", label: "อุปกรณ์" },
  { href: "/admin/checklist", label: "Checklist" },
  { href: "/admin/return-form", label: "Return" },
  { href: "/admin/assets/labels", label: "Label" },
  { href: "/admin/licenses", label: "License" },
  { href: "/admin/history", label: "ประวัติ" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireLogin();
  const pendingCases = (db.prepare("SELECT COUNT(*) n FROM cases WHERE status = 'รอรับ'").get() as { n: number }).n;

  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/5 bg-sidebar text-sidebar-ink sm:flex">
        <div className="border-b border-white/5 px-5 py-5">
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-sidebar-muted">
            KGarden
          </div>
          <div className="mt-1 text-[15px] font-semibold tracking-tight">IT Asset</div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center rounded-lg px-3 py-2 text-[13px] text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-ink"
            >
              {n.label}
              {n.href === "/admin/cases" && pendingCases > 0 && (
                <span className="ml-auto rounded-full bg-warning px-2 py-0.5 text-[10px] font-semibold text-white">
                  {pendingCases}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <form action={logout} className="border-t border-white/5 p-3">
          <button className="w-full rounded-lg px-3 py-2 text-left text-[13px] text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-ink">
            ออกจากระบบ
          </button>
        </form>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-hairline bg-surface px-4 py-3 sm:hidden">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-subtle">KGarden</div>
            <div className="text-sm font-semibold tracking-tight">IT Asset</div>
          </div>
          <nav className="ml-auto flex max-w-[60%] gap-3 overflow-x-auto text-xs text-ink-muted">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="whitespace-nowrap hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
