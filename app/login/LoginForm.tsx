"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";

export default function LoginForm({ next = "" }: { next?: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="space-y-4">
      {next.startsWith("/admin") && <input type="hidden" name="next" value={next} />}
      {state.error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="username" className="label">ชื่อผู้ใช้</label>
        <input id="username" name="username" required autoFocus className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">รหัสผ่าน</label>
        <input id="password" name="password" type="password" required className="input" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full py-2.5">
        {pending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
