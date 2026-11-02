"use client";

import Link from "next/link";
import CartLines from "./CartLines";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";

export default function CartView() {
  const { lines, count, units, subtotal, cart, error } = useCart();

  if (lines.length === 0) {
    return (
      <section className="empty">
        <h1>Seu carrinho está vazio</h1>
        <p className="muted">Escolha um produto para começar.</p>
        <Link href="/loja" className="btn">Ver produtos</Link>
      </section>
    );
  }

  return (
    <section className="cart">
      <h1>Carrinho <span className="muted">({count})</span></h1>
      {error && <p className="alert cart-alert" role="alert">{error}</p>}
      <CartLines />
      <aside className="summary">
        <h2>Resumo</h2>
        <p className="total-row"><span>Subtotal</span><strong>{subtotal && money(subtotal)}</strong></p>
        <p className="muted">{units} {units === 1 ? "unidade" : "unidades"} · Frete e impostos são calculados no checkout.</p>
        <a href={cart?.checkoutUrl} className="btn btn-block">Finalizar compra</a>
      </aside>
    </section>
  );
}
