"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";

export default function Header({ name, nav, account, helpHref, announcement }) {
  const { count, openCart } = useCart();
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSearch(e) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/busca?q=${encodeURIComponent(term)}`);
  }

  const accountLabel = account.loggedIn ? `Minha conta${account.name ? ` (${account.name})` : ""}` : "Entrar";

  return (
    <>
      <div className="utility">
        <div className="utility-inner">
          {helpHref && <Link href={helpHref}>Ajuda</Link>}
          <a href={account.href}>Acompanhe seu pedido</a>
          {account.loggedIn ? (
            <>
              <a href="/conta">Olá, {account.name || "cliente"}</a>
              <a href="/api/auth/logout">Sair</a>
            </>
          ) : (
            <a href={account.href}>Entrar</a>
          )}
        </div>
      </div>

      <header className="header">
        <Link href="/" className="brand">{name}</Link>

        <nav className="nav" aria-label="Principal">
          <Link href="/loja?ordem=novos">Lançamentos</Link>
          {nav.map((c) => (
            <Link key={c.handle} href={`/categorias/${c.handle}`} className="cap">{c.title}</Link>
          ))}
          <Link href="/loja">Todos</Link>
        </nav>

        <div className="header-actions">
          <form className="search" role="search" onSubmit={onSearch}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" aria-label="Buscar produtos" />
          </form>

          {/* <a> comum: a rota de login faz redirecionamento e não deve ser pré-carregada */}
          <a className={`icon-btn ${account.loggedIn ? "is-on" : ""}`} href={account.href} aria-label={accountLabel} title={accountLabel}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </svg>
          </a>

          <button className="icon-btn bag" onClick={openCart} aria-label={`Abrir carrinho, ${count} ${count === 1 ? "produto" : "produtos"}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 016 0v2" /></svg>
            {count > 0 && <span className="badge">{count}</span>}
          </button>
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
