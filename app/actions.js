"use server";

import { cookies } from "next/headers";
import { addLines, createCart, removeLine, updateLine } from "@/lib/shopify";

const COOKIE = "cartId";
const FAIL = "Não foi possível atualizar o carrinho. Tente novamente.";
const out = (r) => ({ cart: r.cart, error: r.errors.join(" ") });

// Todas as ações devolvem o carrinho atualizado, e a interface usa esse retorno
// para atualizar contador e totais na hora.
export async function addToCartAction(variantId, quantity = 1) {
  try {
    const jar = await cookies();
    const cartId = jar.get(COOKIE)?.value;

    let res = cartId ? await addLines(cartId, variantId, quantity) : null;

    // Sem carrinho (ou carrinho expirado/finalizado): cria um novo
    if (!res?.cart) {
      res = await createCart(variantId, quantity);
      if (res.cart) {
        jar.set(COOKIE, res.cart.id, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 14,
          path: "/",
        });
      }
    }
    return out(res);
  } catch (e) {
    console.error("addToCart:", e);
    return { cart: null, error: FAIL };
  }
}

export async function changeQuantityAction(lineId, quantity) {
  try {
    const cartId = (await cookies()).get(COOKIE)?.value;
    if (!cartId) return { cart: null, error: FAIL };
    const res = quantity <= 0 ? await removeLine(cartId, lineId) : await updateLine(cartId, lineId, quantity);
    return out(res);
  } catch (e) {
    console.error("changeQuantity:", e);
    return { cart: null, error: FAIL };
  }
}

export async function removeFromCartAction(lineId) {
  try {
    const cartId = (await cookies()).get(COOKIE)?.value;
    if (!cartId) return { cart: null, error: FAIL };
    return out(await removeLine(cartId, lineId));
  } catch (e) {
    console.error("removeFromCart:", e);
    return { cart: null, error: FAIL };
  }
}
