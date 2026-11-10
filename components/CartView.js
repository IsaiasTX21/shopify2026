"use client";

import Link from "next/link";
import CartLines from "./CartLines";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";
import { plural, t } from "@/lib/i18n";

export default function CartView() {
  const { lines, count, units, subtotal, cart, error } = useCart();

  if (lines.length === 0) {
    return (
      <section className="empty">
        <h1>{t("cart.emptyTitle")}</h1>
        <p className="muted">{t("cart.emptyHint")}</p>
        <Link href="/shop" className="btn">{t("cart.shop")}</Link>
      </section>
    );
  }

  return (
    <section className="cart">
      <h1>{t("cart.title")} <span className="muted">({count})</span></h1>
      {error && <p className="alert cart-alert" role="alert">{error}</p>}
      <CartLines />
      <aside className="summary">
        <h2>{t("cart.summary")}</h2>
        <p className="total-row"><span>{t("cart.subtotal")}</span><strong>{subtotal && money(subtotal)}</strong></p>
        <p className="muted">{t("cart.shipNote", { n: units, word: plural(units, "common.unit") })}</p>
        <a href={cart?.checkoutUrl} className="btn btn-block">{t("cart.checkout")}</a>
      </aside>
    </section>
  );
}
