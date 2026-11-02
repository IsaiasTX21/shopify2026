import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { accountsEnabled, discover } from "@/lib/customer";
import { C, clearSession, originFromHeaders } from "@/lib/session";

export async function GET(request) {
  const origin = originFromHeaders(request.headers);
  const jar = await cookies();
  const idToken = jar.get(C.id)?.value;
  clearSession(jar);

  // Encerra também a sessão na Shopify (o endereço da loja precisa estar em "Logout URI")
  if (accountsEnabled && idToken) {
    try {
      const { logout } = await discover();
      const u = new URL(logout);
      u.searchParams.set("id_token_hint", idToken);
      u.searchParams.set("post_logout_redirect_uri", origin);
      return NextResponse.redirect(u.toString());
    } catch {}
  }
  return NextResponse.redirect(new URL("/", origin));
}
