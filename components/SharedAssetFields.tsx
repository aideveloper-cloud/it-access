"use client";

import { useState } from "react";

export default function SharedAssetFields({
  sharedUse = 0,
  holder = "",
  department = "",
}: {
  sharedUse?: number;
  holder?: string;
  department?: string;
}) {
  const [isShared, setIsShared] = useState(sharedUse === 1);

  return (
    <>
      <div className="sm:col-span-2 lg:col-span-3">
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          <input
            type="checkbox"
            name="shared_use"
            value="1"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
            className="rounded border-hairline-strong"
          />
          ใช้งานร่วมกัน — ระบุแผนก/ตำแหน่ง แทนชื่อบุคคล
        </label>
      </div>
      {!isShared && (
        <div>
          <label className="label">ผู้ถือครอง</label>
          <input name="holder" defaultValue={holder} className="input" placeholder="ชื่อพนักงาน" />
        </div>
      )}
      <div>
        <label className="label">
          {isShared ? "แผนก / ตำแหน่งที่ใช้ร่วมกัน" : "แผนก / ตำแหน่ง"}
        </label>
        <input
          name="department"
          defaultValue={department}
          className="input"
          placeholder={isShared ? "เช่น บัญชี, ห้องประชุม A" : ""}
          required={isShared}
        />
      </div>
      {isShared && <input type="hidden" name="holder" value="" />}
    </>
  );
}
