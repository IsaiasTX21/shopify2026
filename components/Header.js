"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import ThemeToggle from "./ThemeToggle";
import { plural, t } from "@/lib/i18n";

export default function Header({ name, nav, account, helpHref, announcement }) {
  const { count, openCart } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");
  const headerRef = useRef(null);
  const brandRef = useRef(null);
  const navRef = useRef(null);
  const iconsRef = useRef(null);
  const [compact, setCompact] = useState(false);

  useLayoutEffect(() => {
    const header = headerRef.current, brand = brandRef.current, navEl = navRef.current, icons = iconsRef.current;
    if (!header || !brand || !navEl || !icons) return;
    const measure = () => {
      if (window.innerWidth <= 1280) { setCompact(false); return; }
      const cs = getComputedStyle(header);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const avail = header.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const links = Array.from(navEl.children);
      const navGap = parseFloat(getComputedStyle(navEl).columnGap) || 0;
      const navW = links.reduce((n, el) => n + el.offsetWidth, 0) + navGap * Math.max(0, links.length - 1);
      const iconsW = Array.from(icons.children).reduce((n, el) => n + el.offsetWidth, 0) + rem; 
      const searchW = rem * 10.3 + 18; 
      const side = Math.max(brand.offsetWidth, searchW + iconsW + rem * 0.5);
      setCompact(2 * side + navW + 2 * 1.5 * rem > avail);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    ro.observe(navEl);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [nav.length]);

  function onSearch(e) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const accountLabel = account.loggedIn
    ? `${t("account.mine")}${account.name ? ` (${account.name})` : ""}`
    : t("account.signIn");

  return (
    <>
      {helpHref && (
        <div className="utility">
          <div className="utility-inner">
            <Link href={helpHref}>{t("nav.help")}</Link>
          </div>
        </div>
      )}

      <header ref={headerRef} className={`header ${compact ? "is-compact" : ""}`}>
        <Link href="/" className="brand" ref={brandRef}>{name}</Link>

        <nav className="nav" ref={navRef} aria-label={t("nav.main")}>
          {nav.map((c) => (
            <Link key={c.handle} href={c.href || `/collections/${c.handle}`} className={`cap ${c.isSale ? "is-sale" : ""}`}>{c.title}</Link>
          ))}

        </nav>

        <div className="header-actions">
          <form className="search" role="search" onSubmit={onSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.placeholder")} aria-label={t("search.aria")} />
          </form>

          <div className="header-icons" ref={iconsRef}>
            <ThemeToggle />

            {/* <a> comum: a rota de login faz redirecionamento e não deve ser pré-carregada */}
            <a className={`icon-btn ${account.loggedIn ? "is-on" : ""}`} href={account.href} aria-label={accountLabel} title={accountLabel}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
              </svg>
            </a>

            <button className="icon-btn bag" onClick={openCart} aria-label={t("cart.open", { n: count, word: plural(count, "common.product") })}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          </div>
        </div>
      </header>

      {announcement && (
        <div className="announce">
          <p>
            {announcement.text}{" "}
            <Link href={announcement.href}>{announcement.linkLabel}</Link>
          </p>
        </div>
      )}
    </>
  );
}
