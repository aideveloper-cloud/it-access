import Link from "next/link";

type Props = {
  basePath: string;
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  /** query params อื่นๆ ที่ต้องเก็บไว้ (ไม่รวม page) */
  query?: Record<string, string>;
};

function href(basePath: string, page: number, query: Record<string, string> = {}) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const q = sp.toString();
  return q ? `${basePath}?${q}` : basePath;
}

/** แสดงเลขหน้าแบบย่อ เช่น 1 … 4 5 6 … 20 */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => pages.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => pages.add(n));
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("…");
    out.push(sorted[i]);
  }
  return out;
}

export default function Pagination({
  basePath,
  page,
  totalPages,
  total,
  from,
  to,
  query = {},
}: Props) {
  if (total === 0) return null;

  const nums = pageNumbers(page, totalPages);

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-hairline px-4 py-3 text-sm">
      <span className="text-ink-subtle">
        แสดง {from}–{to} จาก {total} รายการ
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-1">
        <Link
          href={href(basePath, Math.max(1, page - 1), query)}
          aria-disabled={page <= 1}
          className={`btn btn-secondary px-2.5 py-1.5 text-xs ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          ก่อนหน้า
        </Link>
        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`e${i}`} className="px-1 text-ink-subtle">
              …
            </span>
          ) : (
            <Link
              key={n}
              href={href(basePath, n, query)}
              className={`min-w-8 rounded-lg px-2.5 py-1.5 text-center text-xs font-medium ${
                n === page
                  ? "bg-accent text-white"
                  : "text-ink-muted hover:bg-surface-muted"
              }`}
            >
              {n}
            </Link>
          )
        )}
        <Link
          href={href(basePath, Math.min(totalPages, page + 1), query)}
          aria-disabled={page >= totalPages}
          className={`btn btn-secondary px-2.5 py-1.5 text-xs ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          ถัดไป
        </Link>
      </div>
    </div>
  );
}
