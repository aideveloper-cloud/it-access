"use client";

import { teamForCaseType } from "@/lib/constants";

export default function CaseTypeSelect({
  types,
  defaultType,
}: {
  types: readonly string[];
  defaultType: string;
}) {
  return (
    <select
      name="case_type"
      defaultValue={defaultType}
      className="input"
      onChange={(e) => {
        const preview = document.querySelector<HTMLInputElement>("[data-team-preview]");
        if (preview) preview.value = teamForCaseType(e.target.value);
      }}
    >
      {types.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
  );
}
