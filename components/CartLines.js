"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";
import { colorOf } from "@/lib/variants";
import { t } from "@/lib/i18n";

export default function CartLines({ onNavigate }) {
  const { lines, busy, setQuantity, remove } = useCart();

  return (
    <ul className="lines" aria-busy={busy}>
      {lines.map((line) => {
        const v = line.merchandise;
        const hasColor = !!colorOf(v);
        // Foto real da variante. Se for um produto com cores e a foto da cor não está
        // associada no painel, mostramos a cor em vez da foto errada.
        const img = line.resolvedImage || (!hasColor ? v.product.featuredImage : null);
        const opts = v.title === "Default Title" ? [] : v.selectedOptions;
        return (
          <li className="line" key={line.id}>
            <div className="line-img">
              {img ? (
                <Image src={img.url} alt={img.altText || v.product.title} fill sizes="96px" />
              ) : (
                <span className="dot" style={{ background: line.colorDot || "#ddd" }} aria-hidden="true" />
              )}
            </div>
            <div className="line-info">
              <Link href={`/products/${v.product.handle}`} onClick={onNavigate}>{v.product.title}</Link>
              {opts.map((o) => (
                <span className="muted" key={o.name}>{o.name}: {o.value}</span>
              ))}
              <div className="qty">
                <button aria-label={t("cart.decrease")} disabled={busy} onClick={() => setQuantity(line.id, line.quantity - 1)}>−</button>
                <span aria-live="polite">{line.quantity}</span>
                <button aria-label={t("cart.increase")} disabled={busy} onClick={() => setQuantity(line.id, line.quantity + 1)}>+</button>
                <button className="link" disabled={busy} onClick={() => remove(line.id)}>{t("cart.remove")}</button>
              </div>
            </div>
            <p className="line-total">{money(line.cost.totalAmount)}</p>
          </li>
        );
      })}
    </ul>
  );
}
