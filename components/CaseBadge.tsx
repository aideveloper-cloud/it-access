import {
  CASE_STATUS_STYLES,
  CASE_TEAM_STYLES,
  CASE_PRIORITY_STYLES,
} from "@/lib/constants";

export function CaseStatusBadge({ status }: { status: string }) {
  const style = CASE_STATUS_STYLES[status] ?? "bg-surface-muted text-ink-subtle";
  return <span className={`badge ${style}`}>{status}</span>;
}

export function CaseTeamBadge({ team }: { team: string }) {
  const style = CASE_TEAM_STYLES[team] ?? "bg-surface-muted text-ink-subtle";
  return <span className={`badge ${style}`}>{team}</span>;
}

export function CasePriorityBadge({ priority }: { priority: string }) {
  const style = CASE_PRIORITY_STYLES[priority] ?? "bg-surface-muted text-ink-subtle";
  return <span className={`badge ${style}`}>{priority}</span>;
}
