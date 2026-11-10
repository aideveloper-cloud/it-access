"use client";

export default function DeleteCaseButton({
  title,
  action,
}: {
  title: string;
  action: () => Promise<void>;
}) {
  return (
    <button
      type="button"
      className="btn btn-danger"
      onClick={() => {
        if (confirm(`ลบเคส "${title}" ?`)) {
          action();
        }
      }}
    >
      ลบเคส
    </button>
  );
}
