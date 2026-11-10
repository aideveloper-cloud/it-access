/** URL ฐานสำหรับ QR บน label — ตั้ง ASSET_PUBLIC_URL ใน production */
export function assetPublicBaseUrl(): string {
  return (
    process.env.ASSET_PUBLIC_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function assetScanUrl(assetCode: string): string {
  return `${assetPublicBaseUrl()}/admin/assets/scan/${encodeURIComponent(assetCode)}`;
}
