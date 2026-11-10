"use client";

export default function DeleteAssetButton({
  assetCode,
  action,
}: {
  assetCode: string;
  action: () => Promise<void>;
}) {
  return (
    <button
      type="button"
      className="btn btn-danger"
      onClick={() => {
        if (confirm(`ลบอุปกรณ์ "${assetCode}" ?`)) {
          action();
        }
      }}
    >
      ลบ
    </button>
  );
}
