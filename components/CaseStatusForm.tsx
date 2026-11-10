"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CASE_STATUSES } from "@/lib/constants";

export default function CaseStatusForm({
  currentStatus,
  action,
  compact = false,
}: {
  currentStatus: string;
  action: (formData: FormData) => Promise<void>;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function submit(formData: FormData) {
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  }

  return (
    <form action={submit} className={compact ? "inline-flex items-center gap-1" : "inline-flex flex-wrap items-center gap-2"}>
      <select
        name="status"
        key={currentStatus}
        defaultValue={currentStatus}
        disabled={pending}
        className={compact ? "input w-auto py-1 text-xs" : "input w-auto"}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
      >
        {CASE_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      {!compact && (
        <button type="submit" disabled={pending} className="btn btn-primary text-xs">
          {pending ? "กำลังบันทึก…" : "บันทึกสถานะ"}
        </button>
      )}
    </form>
  );
}
