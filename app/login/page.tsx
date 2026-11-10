import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "เข้าสู่ระบบ — KGarden IT Asset",
  robots: { index: false, follow: false },
};

function safeAdminDest(next: string) {
  const path = next.trim();
  if (path === "/admin" || path === "/admin/") return "/admin/overview";
  if (path.startsWith("/admin/") || path.startsWith("/admin?")) return path;
  return "/admin/overview";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "" } = await searchParams;
  if (await isLoggedIn()) redirect(safeAdminDest(next));

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-sidebar-muted">
            KGarden
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-sidebar-ink">IT Asset</h1>
          <p className="mt-2 text-sm text-sidebar-muted">เข้าสู่ระบบสำหรับทีม IT Support</p>
        </div>
        <div className="card p-7">
          <LoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
