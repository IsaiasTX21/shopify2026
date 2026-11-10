"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/lib/i18n";

// Filtros da Shopify (Search & Discovery): Cor, Tamanho, Material, Gênero alvo...
export default function FilterPanel({ filters, selected, params }) {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const groups = filters.filter((f) => f.type !== "PRICE_RANGE" && f.values.length);
  if (!groups.length) return null;

  function go(list) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params || {})) if (v) qs.set(k, v);
    list.forEach((x) => qs.append("f", x));
    const s = qs.toString();
    router.push(s ? `${path}?${s}` : path, { scroll: false });
  }
  const toggle = (input) => go(selected.includes(input) ? selected.filter((x) => x !== input) : [...selected, input]);

  return (
    <aside className="filters" aria-label={t("filters.title")}>
      <button className="filters-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {t("filters.title")}{selected.length ? ` (${selected.length})` : ""}
      </button>
      <div className={`filters-body ${open ? "is-open" : ""}`}>
        {selected.length > 0 && <button className="link-btn" onClick={() => go([])}>{t("filters.clear")}</button>}
        {groups.map((g) => (
          <details key={g.id} open className="fgroup">
            <summary>{g.label}</summary>
            <ul>
              {g.values.map((v) => {
                const on = selected.includes(v.input);
                const off = v.count === 0 && !on;
                return (
                  <li key={v.id}>
                    <label className={off ? "is-disabled" : ""}>
                      <input type="checkbox" checked={on} disabled={off} onChange={() => toggle(v.input)} />
                      <span>{v.label}</span>
                      <small>{v.count}</small>
                    </label>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
      </div>
    </aside>
  );
}
