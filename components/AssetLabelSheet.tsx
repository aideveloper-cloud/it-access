"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type LabelCodeType = "barcode" | "qr";

export type AssetLabelData = {
  id: number;
  asset_code: string;
  qrDataUrl: string;
};

export default function AssetLabelSheet({ labels }: { labels: AssetLabelData[] }) {
  const [codeType, setCodeType] = useState<LabelCodeType>("barcode");
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(() => new Set(labels.map((l) => l.id)));
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => {
    setReady(true);
  }, []);

  // เมื่อรายการ labels เปลี่ยน (ค้นหา/หน้า) — เลือกทั้งหมดในหน้านี้
  useEffect(() => {
    setSelected(new Set(labels.map((l) => l.id)));
  }, [labels]);

  const selectedLabels = useMemo(
    () => labels.filter((l) => selected.has(l.id)),
    [labels, selected]
  );

  useEffect(() => {
    if (codeType !== "barcode") return;
    let cancelled = false;
    void import("jsbarcode").then(({ default: JsBarcode }) => {
      if (cancelled) return;
      labels.forEach((label, i) => {
        if (!selected.has(label.id)) return;
        const el = barcodeRefs.current[i];
        if (!el || !label.asset_code) return;
        try {
          JsBarcode(el, label.asset_code, {
            format: "CODE128",
            width: 1.2,
            height: 32,
            displayValue: false,
            margin: 0,
          });
        } catch {
          /* skip */
        }
      });
    });
    return () => {
      cancelled = true;
    };
  }, [labels, codeType, selected]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(labels.map((l) => l.id)));
  }

  function clearAll() {
    setSelected(new Set());
  }

  function printSelected() {
    if (selected.size === 0) return;
    window.print();
  }

  const allSelected = labels.length > 0 && selected.size === labels.length;

  return (
    <div data-testid="label-sheet" data-mode={codeType} data-ready={ready ? "1" : "0"}>
      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex rounded-lg border border-hairline-strong bg-white p-1 text-sm">
          <button
            type="button"
            data-testid="label-mode-barcode"
            aria-pressed={codeType === "barcode"}
            onClick={() => setCodeType("barcode")}
            className={`rounded-md px-3 py-1.5 ${
              codeType === "barcode" ? "bg-accent text-white" : "text-ink-muted hover:bg-surface-muted"
            }`}
          >
            Barcode
          </button>
          <button
            type="button"
            data-testid="label-mode-qr"
            aria-pressed={codeType === "qr"}
            onClick={() => setCodeType("qr")}
            className={`rounded-md px-3 py-1.5 ${
              codeType === "qr" ? "bg-accent text-white" : "text-ink-muted hover:bg-surface-muted"
            }`}
          >
            QR Code
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-ink-muted">
            <input
              type="checkbox"
              className="rounded border-hairline-strong"
              checked={allSelected}
              onChange={() => (allSelected ? clearAll() : selectAll())}
            />
            เลือกทั้งหมด ({selected.size}/{labels.length})
          </label>
          <button type="button" onClick={selectAll} className="btn btn-secondary text-xs">
            ทั้งหมด
          </button>
          <button type="button" onClick={clearAll} className="btn btn-secondary text-xs">
            ล้าง
          </button>
        </div>

        <button
          type="button"
          onClick={printSelected}
          disabled={selected.size === 0}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          พิมพ์ที่เลือก ({selected.size})
        </button>
        <span className="text-xs text-ink-subtle" data-testid="label-mode-hint">
          ติ๊กเลือก Label ที่ต้องการแล้วกดพิมพ์ — โหมด{" "}
          {codeType === "barcode" ? "Barcode" : "QR"}
        </span>
      </div>

      <div className="label-grid grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 print:grid-cols-6 print:gap-1">
        {labels.map((label, i) => {
          const isOn = selected.has(label.id);
          return (
            <div
              key={label.id}
              className={`label-card relative flex flex-col items-center justify-center rounded border bg-white p-2 print:rounded-none print:border print:border-black print:p-1 ${
                isOn
                  ? "border-accent ring-1 ring-accent/30 print:block"
                  : "border-hairline opacity-50 print:hidden"
              }`}
            >
              <label className="absolute left-1.5 top-1.5 z-10 print:hidden">
                <input
                  type="checkbox"
                  className="rounded border-hairline-strong"
                  checked={isOn}
                  onChange={() => toggle(label.id)}
                  aria-label={`เลือก ${label.asset_code}`}
                />
              </label>
              <div className="text-center font-bold leading-none text-ink print:text-[9pt]">
                {label.asset_code}
              </div>
              {codeType === "barcode" ? (
                <svg
                  ref={(el) => {
                    barcodeRefs.current[i] = el;
                  }}
                  className="label-barcode mt-1 h-8 w-full max-w-full print:h-7"
                />
              ) : (
                label.qrDataUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={label.qrDataUrl}
                    alt=""
                    className="label-qr mt-1 h-14 w-14 print:h-12 print:w-12"
                  />
                )
              )}
            </div>
          );
        })}
      </div>

      {selectedLabels.length === 0 && (
        <p className="mt-3 text-sm text-ink-subtle print:hidden">
          ยังไม่ได้เลือก Label — ติ๊กอย่างน้อย 1 รายการก่อนพิมพ์
        </p>
      )}
    </div>
  );
}
