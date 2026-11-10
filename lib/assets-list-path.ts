export function assetsListPath(query: {
  q?: string;
  category?: string;
  status?: string;
  page?: number;
}): string {
  const sp = new URLSearchParams();
  if (query.q) sp.set("q", query.q);
  if (query.category) sp.set("category", query.category);
  if (query.status) sp.set("status", query.status);
  if (query.page && query.page > 1) sp.set("page", String(query.page));
  const qs = sp.toString();
  return qs ? `/admin/assets?${qs}` : "/admin/assets";
}
