"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import CartLines from "./CartLines";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";

export default function CartDrawer() {
  const { open, closeCart, lines, count, units, subtotal, cart, error } = useCart();
  const closeRef = useRef(null);

  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);

  return (
    <div className={`drawer-root ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="drawer-overlay" onClick={closeCart} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Carrinho">
        <header className="drawer-head">
          <h2>Carrinho ({count})</h2>
          <button ref={closeRef} className="icon-btn" onClick={closeCart} aria-label="Fechar carrinho" tabIndex={open ? 0 : -1}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l14 14M19 5L5 19" /></svg>
          </button>
        </header>

        {error && <p className="alert" role="alert">{error}</p>}

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p>Seu carrinho está vazio.</p>
            <Link href="/loja" className="btn" onClick={closeCart}>Ver produtos</Link>
          </div>
        ) : (
          <>
            <div className="drawer-body"><CartLines onNavigate={closeCart} /></div>
            <footer className="drawer-foot">
              <p className="total-row"><span>Subtotal</span><strong>{subtotal && money(subtotal)}</strong></p>
              <p className="muted">{units} {units === 1 ? "unidade" : "unidades"} · Frete e impostos são calculados no checkout.</p>
              <a href={cart?.checkoutUrl} className="btn btn-block">Finalizar compra</a>
              <Link href="/carrinho" className="btn btn-ghost btn-block" onClick={closeCart}>Ver carrinho completo</Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
