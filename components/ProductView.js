"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { money } from "@/lib/format";
import { colorCss, colorOfImage, getOptions, isColorOption, resolveImages } from "@/lib/variants";

const key = (u) => u.split("?")[0];
const toSel = (v) => Object.fromEntries(v.selectedOptions.map((o) => [o.name, o.value]));
const hasValue = (v, name, value) => v.selectedOptions.some((o) => o.name === name && o.value === value);

export default function ProductView({ product, category, subtitle, children }) {
  const { add, busy, error, lines } = useCart();
  const variants = product.variants.nodes;
  const images = product.images.nodes;
  const options = useMemo(() => getOptions(variants), [variants]);
  // variantId -> imagem real da variante (null quando não está associada no painel)
  const resolved = useMemo(() => resolveImages(variants, images), [variants, images]);
  const hasOptions = !(variants.length === 1 && variants[0].title === "Default Title");

  const first = variants.find((v) => v.availableForSale) || variants[0];
  const [sel, setSel] = useState(() => toSel(first));
  const [qty, setQty] = useState(1);
  const [activeUrl, setActiveUrl] = useState(null);

  // A variante escolhida é SEMPRE a que combina com todas as opções selecionadas.
  // É o id dela que vai para o carrinho.
  const variant = variants.find((v) => v.selectedOptions.every((o) => sel[o.name] === o.value)) || first;

  function pick(name, value, keepUrl = null) {
    const score = (v) =>
      v.selectedOptions.filter((o) => o.name !== name && sel[o.name] === o.value).length * 10 +
      (v.availableForSale ? 1 : 0);
    const best = variants.filter((v) => hasValue(v, name, value)).sort((a, b) => score(b) - score(a))[0];
    if (best) setSel(toSel(best));
    setActiveUrl(keepUrl);
  }

  // Clicar numa imagem seleciona a cor correspondente (se for possível identificá-la)
  function onThumb(img) {
    const colorOpt = options.find((o) => isColorOption(o.name));
    const color = colorOpt ? colorOfImage(img, variants, resolved) : null;
    if (colorOpt && color && sel[colorOpt.name] !== color) pick(colorOpt.name, color, img.url);
    else setActiveUrl(img.url);
  }

  function status(name, value) {
    const c = variants.filter(
      (v) => hasValue(v, name, value) && v.selectedOptions.every((o) => o.name === name || sel[o.name] === o.value)
    );
    if (!c.length) return "missing";
    return c.some((v) => v.availableForSale) ? "ok" : "soldout";
  }

  const variantImg = resolved.get(variant.id);
  const shownUrl = activeUrl || variantImg?.url || images[0]?.url;
  const shown = images.find((i) => shownUrl && key(i.url) === key(shownUrl)) || variantImg || images[0];

  const onSale = variant.compareAtPrice && Number(variant.compareAtPrice.amount) > Number(variant.price.amount);
  const inCart = lines.find((l) => l.merchandise.id === variant.id)?.quantity ?? 0;
  const label = hasOptions ? variant.selectedOptions.map((o) => o.value).join(" / ") : "";

  // Aviso só em desenvolvimento: cores sem foto associada no painel da Shopify
  const colorOpt = options.find((o) => isColorOption(o.name));
  const unlinked =
    process.env.NODE_ENV !== "production" && colorOpt && colorOpt.values.length > 1
      ? colorOpt.values.filter((val) => !variants.some((v) => hasValue(v, colorOpt.name, val) && resolved.get(v.id)))
      : [];

  async function handleAdd() {
    const ok = await add(variant.id, qty);
    if (ok) setQty(1);
  }

  return (
    <div className="product">
      <div className={`pv-gallery ${images.length < 2 ? "single" : ""}`}>
        {images.length > 1 && (
          <ul className="thumbs">
            {images.map((img) => (
              <li key={img.url}>
                <button
                  className={shown && key(img.url) === key(shown.url) ? "is-active" : ""}
                  onClick={() => onThumb(img)}
                  aria-label={`Ver imagem: ${img.altText || product.title}`}
                >
                  <Image src={img.url} alt="" fill sizes="72px" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="stage">
          {shown && (
            <Image
              key={shown.url}
              src={shown.url}
              alt={shown.altText || `${product.title}${label ? ` - ${label}` : ""}`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 55vw"
            />
          )}
        </div>
      </div>

      <div className="product-info">
        {(category || subtitle) && (
          <p className="card-cat">
            {category && (
              <Link href={`/categorias/${category.handle}`} className="cap">{category.title}</Link>
            )}
            {category && subtitle && " · "}
            {subtitle}
          </p>
        )}
        <h1>{product.title}</h1>

        <div className="buy">
          <p className="price big">
            {money(variant.price)}
            {onSale && <s>{money(variant.compareAtPrice)}</s>}
          </p>

          {hasOptions &&
            options.map((opt) => {
              const color = isColorOption(opt.name);
              return (
                <fieldset className="options" key={opt.name}>
                  <legend>
                    {opt.name}: <strong>{sel[opt.name]}</strong>
                  </legend>
                  <div className={color ? "swatch-grid" : "option-grid"}>
                    {opt.values.map((val) => {
                      const st = status(opt.name, val);
                      const active = sel[opt.name] === val;
                      const soldout = st === "soldout";
                      if (color) {
                        const vv = variants.find((v) => hasValue(v, opt.name, val) && resolved.get(v.id));
                        const img = vv ? resolved.get(vv.id) : null;
                        const css = colorCss(val);
                        return (
                          <button
                            key={val}
                            type="button"
                            className={`swatch ${active ? "is-selected" : ""} ${soldout ? "is-soldout" : ""}`}
                            aria-pressed={active}
                            aria-label={`${val}${soldout ? " (esgotado)" : ""}`}
                            title={val}
                            onClick={() => pick(opt.name, val)}
                          >
                            {img ? (
                              <Image src={img.url} alt="" fill sizes="64px" />
                            ) : css ? (
                              <span className="dot" style={{ background: css }} />
                            ) : (
                              <span className="txt">{val}</span>
                            )}
                          </button>
                        );
                      }
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`option ${active ? "is-selected" : ""} ${soldout ? "is-soldout" : ""}`}
                          aria-pressed={active}
                          aria-label={`${val}${soldout ? " (esgotado)" : ""}`}
                          onClick={() => pick(opt.name, val)}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}

          <div className="qty-field">
            <span id="qty-label">Quantidade</span>
            <div className="stepper" role="group" aria-labelledby="qty-label">
              <button type="button" aria-label="Diminuir" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <input
                type="number" inputMode="numeric" min={1} max={99} value={qty} aria-label="Quantidade"
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setQty(Number.isFinite(n) ? Math.min(99, Math.max(1, n)) : 1);
                }}
              />
              <button type="button" aria-label="Aumentar" disabled={qty >= 99} onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
            </div>
            {qty > 1 && variant.availableForSale && (
              <span className="muted">Total: {money({ amount: Number(variant.price.amount) * qty, currencyCode: variant.price.currencyCode })}</span>
            )}
          </div>

          <button className="btn btn-block" disabled={busy || !variant.availableForSale} onClick={handleAdd}>
            {!variant.availableForSale ? "Esgotado" : busy ? "Adicionando..." : `Adicionar ao carrinho${label ? ` (${label})` : ""}`}
          </button>
          {inCart > 0 && <p className="muted">Já no carrinho: {inCart} × {label || product.title}. Para mudar a quantidade, use o carrinho.</p>}
          {error && <p className="alert" role="alert">{error}</p>}

          {unlinked.length > 0 && (
            <p className="dev-note">
              <strong>Aviso (só aparece em desenvolvimento):</strong> no painel da Shopify, a(s) cor(es){" "}
              {unlinked.join(", ")} não têm foto associada à variante. Abra cada variante e escolha a imagem dela;
              sem isso a foto muda só por texto alternativo/nome do arquivo e o checkout mostra a foto principal.
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
