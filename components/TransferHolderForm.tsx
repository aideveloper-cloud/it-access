"use client";

const inputCls = "input";

export default function TransferHolderForm({
  asset,
  action,
}: {
  asset: { shared_use: number; holder: string; department: string; location: string };
  action: (formData: FormData) => Promise<void>;
}) {
  const isShared = asset.shared_use === 1;

  return (
    <form action={action} className="space-y-3">
      <p className="text-xs text-ink-subtle">
        {isShared
          ? "อุปกรณ์ใช้งานร่วมกัน — แก้ชื่อแผนก/ตำแหน่งแทนชื่อบุคคล ประวัติเดิมไม่หาย"
          : "ใช้เมื่อพนักงานเปลี่ยนเครื่อง / โอนอุปกรณ์ — บันทึกประวัติโอนย้ายอัตโนมัติ"}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {!isShared && (
          <div>
            <label className="label">ผู้ถือครองใหม่</label>
            <input name="holder" defaultValue={asset.holder} className={inputCls} placeholder="ชื่อพนักงาน" />
          </div>
        )}
        <div>
          <label className="label">
            {isShared ? "แผนก / ตำแหน่งที่ใช้ร่วมกัน" : "แผนก / ตำแหน่ง"}
          </label>
          <input name="department" defaultValue={asset.department} className={inputCls} />
        </div>
        <div>
          <label className="label">สถานที่</label>
          <input name="location" defaultValue={asset.location} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="label">เหตุผล / หมายเหตุ (ถ้ามี)</label>
        <input name="note" className={inputCls} placeholder="เช่น โอนจากคุณ A ไปคุณ B, ย้ายแผนก" />
      </div>
      <button className="btn btn-primary bg-warning hover:bg-warning/90">
        บันทึกการโอนย้าย
      </button>
    </form>
  );
}
