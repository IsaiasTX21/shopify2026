"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import CartLines from "./CartLines";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";
import { plural, t } from "@/lib/i18n";

export default function CartDrawer() {
  const { open, closeCart, lines, count, units, subtotal, cart, error } = useCart();
  const closeRef = useRef(null);

  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);

  return (
    <div className={`drawer-root ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="drawer-overlay" onClick={closeCart} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t("cart.title")}>
        <header className="drawer-head">
          <h2>{t("cart.title")} ({count})</h2>
          <button ref={closeRef} className="icon-btn" onClick={closeCart} aria-label={t("cart.close")} tabIndex={open ? 0 : -1}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </header>

        {error && <p className="alert" role="alert">{error}</p>}

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>{t("cart.emptyText")}</p>
            <Link href="/shop" className="btn" onClick={closeCart}>{t("cart.shop")}</Link>
          </div>
        ) : (
          <>
            <div className="drawer-body"><CartLines onNavigate={closeCart} /></div>
            <footer className="drawer-foot">
              <p className="total-row"><span>{t("cart.subtotal")}</span><strong>{subtotal && money(subtotal)}</strong></p>
              <p className="muted">{t("cart.shipNote", { n: units, word: plural(units, "common.unit") })}</p>
              <a href={cart?.checkoutUrl} className="btn btn-block">{t("cart.checkout")}</a>
              <Link href="/cart" className="btn btn-ghost btn-block" onClick={closeCart}>{t("cart.viewFull")}</Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
