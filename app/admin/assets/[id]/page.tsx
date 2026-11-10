import Link from "next/link";
import { notFound } from "next/navigation";
import { db, assetAge, assetOwnerLabel, type Asset, type AssetLog } from "@/lib/db";
import { LOG_ACTIONS, formatBaht } from "@/lib/constants";
import { safeAdminReturn } from "@/lib/safe-return";
import { deleteAsset, addAssetLog, updateAssetStatus, transferAssetHolder } from "@/lib/actions";
import StatusBadge from "@/components/StatusBadge";
import StatusChangeForm from "@/components/StatusChangeForm";
import TransferHolderForm from "@/components/TransferHolderForm";
import DeleteAssetButton from "@/components/DeleteAssetButton";

export const dynamic = "force-dynamic";

const inputCls = "input";

export default async function AssetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from = "" } = await searchParams;
  const backHref = safeAdminReturn(from, "/admin/assets");
  const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(Number(id)) as
    | Asset
    | undefined;
  if (!asset) notFound();

  const logs = db
    .prepare("SELECT * FROM asset_logs WHERE asset_id = ? ORDER BY id DESC")
    .all(asset.id) as unknown as AssetLog[];
  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);

  const rows: [string, React.ReactNode][] = [
    ["ยี่ห้อ / รุ่น", `${asset.brand} ${asset.model}`.trim() || "-"],
    ["Serial Number", asset.serial_no || "-"],
    ["Spec", asset.spec || "-"],
    [
      "วันที่เปิดใช้งาน",
      asset.start_date ? `${asset.start_date} (อายุ ${assetAge(asset.start_date)})` : "-",
    ],
    [
      asset.shared_use === 1 ? "ใช้งานโดย (แผนก)" : "ผู้ถือครอง",
      assetOwnerLabel(asset),
    ],
    ...(asset.shared_use !== 1 && asset.department
      ? [["แผนก / ตำแหน่ง", asset.department] as [string, React.ReactNode]]
      : []),
    ["สถานที่", asset.location || "-"],
    ["เบอร์โทร", asset.phone || "-"],
    ["หมายเหตุ", asset.note || "-"],
    [
      "ค่าซ่อมสะสม",
      totalCost > 0 ? (
        <span key="cost" className="font-semibold text-warning">
          {formatBaht(totalCost)} บาท
        </span>
      ) : (
        "-"
      ),
    ],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-ink">
          {asset.asset_code} <span className="text-sm font-normal text-ink-subtle">· {asset.category}</span>
        </h1>
        <StatusBadge status={asset.status} />
        {asset.shared_use === 1 && (
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
            ใช้งานร่วมกัน
          </span>
        )}
        <StatusChangeForm
          assetId={asset.id}
          currentStatus={asset.status}
          action={updateAssetStatus.bind(null, asset.id)}
        />
        <div className="ml-auto flex flex-wrap gap-2">
          <Link
            href={backHref}
            className="rounded-lg border border-hairline-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            ← กลับ
          </Link>
          <Link
            href={`/admin/assets/${asset.id}/label`}
            className="rounded-lg border border-hairline-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            🏷️ Label
          </Link>
          <Link
            href={`/admin/assets/${asset.id}/edit?from=${encodeURIComponent(backHref)}`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            แก้ไข
          </Link>
          <DeleteAssetButton assetCode={asset.asset_code} action={deleteAsset.bind(null, asset.id)} />
        </div>
      </div>

      <dl className="card grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 p-5 text-sm sm:grid-cols-[160px_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-ink-subtle">{k}</dt>
            <dd className="whitespace-pre-wrap">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="rounded-xl border border-warning/25 bg-warning/5 p-5">
        <h2 className="mb-3 font-semibold text-ink">โอนย้ายผู้ถือครอง</h2>
        <TransferHolderForm
          asset={{
            shared_use: asset.shared_use,
            holder: asset.holder,
            department: asset.department,
            location: asset.location,
          }}
          action={transferAssetHolder.bind(null, asset.id)}
        />
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-ink">เพิ่มบันทึก (ซ่อม / ตรวจเช็ค)</h2>
        <form action={addAssetLog.bind(null, asset.id)} className="flex flex-wrap items-start gap-2">
          <select name="action" className={inputCls}>
            {LOG_ACTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <textarea
            name="detail"
            rows={2}
            placeholder="รายละเอียด เช่น อาการเสีย วิธีแก้ อะไหล่ที่เปลี่ยน..."
            className={`${inputCls} min-w-[240px] flex-1`}
          />
          <input
            type="number"
            name="cost"
            min="0"
            step="0.01"
            placeholder="ค่าใช้จ่าย (บาท)"
            className={`${inputCls} w-36`}
          />
          <button className="rounded-lg bg-accent px-4 py-2 text-sm text-white hover:bg-accent-hover">
            บันทึก
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-semibold text-ink">ประวัติทั้งหมด</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-ink-subtle">ไม่มีประวัติ</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs text-ink-subtle">
                <th className="py-2 pr-4">วันที่</th>
                <th className="py-2">รายการ</th>
                <th className="py-2 pl-4 text-right">ค่าใช้จ่าย</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-hairline align-top last:border-0">
                  <td className="whitespace-nowrap py-2 pr-4 text-ink-subtle">{l.created_at}</td>
                  <td className="py-2">
                    <span className="font-medium">{l.action}</span>
                    {l.detail && (
                      <div className="whitespace-pre-wrap text-xs text-ink-subtle">{l.detail}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2 pl-4 text-right">
                    {l.cost > 0 ? `${formatBaht(l.cost)} ฿` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
