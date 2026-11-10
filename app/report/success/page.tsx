import Link from "next/link";

export const metadata = { title: "ส่งแจ้งปัญหาแล้ว — KGarden" };

export default async function ReportSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <div className="card p-8 text-center sm:p-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        ✓
      </div>
      <h1 className="mt-5 page-title">ส่งแจ้งปัญหาเรียบร้อย</h1>
      {id ? (
        <>
          <p className="mt-3 text-ink-muted">
            เลขเคสของคุณคือ{" "}
            <span className="code-chip rounded-md bg-accent-soft px-2.5 py-1 text-accent">
              #{id}
            </span>
          </p>
          <p className="mt-2 text-sm text-ink-subtle">
            เก็บเลขเคสนี้ไว้ตรวจสอบสถานะได้ที่หน้า &quot;ตรวจสอบสถานะ&quot;
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href={`/report/status?id=${id}`} className="btn btn-primary">
              ตรวจสอบสถานะเคส
            </Link>
            <Link href="/report" className="btn btn-secondary">
              แจ้งเคสใหม่
            </Link>
          </div>
        </>
      ) : (
        <p className="mt-3 text-ink-muted">ทีม IT จะดำเนินการตามลำดับ</p>
      )}
    </div>
  );
}
