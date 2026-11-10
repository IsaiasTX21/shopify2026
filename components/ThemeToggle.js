"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

// Alterna entre tema claro e escuro e lembra a escolha (o tema inicial é definido por um script no <head>, sem piscar)
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);
  useEffect(() => { setTheme(document.documentElement.dataset.theme || "light"); }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.classList.add("theme-anim");
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    setTheme(next);
    setTimeout(() => root.classList.remove("theme-anim"), 450);
  }

  const dark = theme === "dark";
  return (
    <button
      className="icon-btn theme-btn"
      onClick={toggle}
      aria-pressed={theme ? dark : undefined}
      aria-label={theme ? (dark ? t("theme.toLight") : t("theme.toDark")) : t("theme.toggle")}
      title={dark ? t("theme.lightTitle") : t("theme.darkTitle")}
    >
      <svg className="ico-moon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
      </svg>
      <svg className="ico-sun" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
