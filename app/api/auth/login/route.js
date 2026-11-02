import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { accountsEnabled, buildAuthorizeUrl, pkce } from "@/lib/customer";
import { C, cookieOpts, originFromHeaders, safeReturnTo } from "@/lib/session";

export async function GET(request) {
  const origin = originFromHeaders(request.headers);
  if (!accountsEnabled) return NextResponse.redirect(new URL("/", origin));

  const returnTo = safeReturnTo(new URL(request.url).searchParams.get("returnTo"));
  const p = pkce();
  const jar = await cookies();
  jar.set(C.flow, JSON.stringify({ state: p.state, nonce: p.nonce, verifier: p.verifier, returnTo }), cookieOpts(600));

  try {
    return NextResponse.redirect(await buildAuthorizeUrl({ origin, challenge: p.challenge, state: p.state, nonce: p.nonce }));
  } catch (e) {
    return NextResponse.redirect(new URL(`/conta?erro=${encodeURIComponent(e.message)}`, origin));
  }
}
