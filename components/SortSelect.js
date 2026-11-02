"use client";

import { usePathname, useRouter } from "next/navigation";
import { SORT_LABELS } from "@/lib/sorts";

export default function SortSelect({ current, keep = [] }) {
  const router = useRouter();
  const path = usePathname();
  function onChange(e) {
    const qs = new URLSearchParams({ ordem: e.target.value });
    keep.forEach((x) => qs.append("f", x)); // mantém os filtros ao reordenar
    router.push(`${path}?${qs.toString()}`);
  }
  return (
    <label className="sort">
      Ordenar por
      <select value={current} onChange={onChange}>
        {Object.entries(SORT_LABELS).map(([k, label]) => (
          <option key={k} value={k}>{label}</option>
        ))}
      </select>
    </label>
  );
}
