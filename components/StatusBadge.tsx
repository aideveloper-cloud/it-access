import { STATUS_STYLES } from "@/lib/constants";

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-surface-muted text-ink-subtle";
  return <span className={`badge ${style}`}>{status}</span>;
}
