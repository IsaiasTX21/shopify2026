import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { t } from "@/lib/i18n";
import { customerQuery, exchangeCode, jwtNonce } from "@/lib/customer";
import { C, cookieOpts, originFromHeaders, safeReturnTo, storeTokens } from "@/lib/session";

export async function GET(request) {
  const origin = originFromHeaders(request.headers);
  const url = new URL(request.url);
  const jar = await cookies();
  let flow = null;
  try { flow = JSON.parse(jar.get(C.flow)?.value ?? "null"); } catch {}
  jar.delete(C.flow);

  const fail = (m) => NextResponse.redirect(new URL(`/account?error=${encodeURIComponent(m)}`, origin));
  if (url.searchParams.get("error")) return fail(url.searchParams.get("error_description") || t("auth.cancelled"));

  const code = url.searchParams.get("code");
  if (!flow || !code || url.searchParams.get("state") !== flow.state) {
    return fail(t("auth.invalid"));
  }

  try {
    const tok = await exchangeCode({ origin, code, verifier: flow.verifier });
    if (tok.id_token && jwtNonce(tok.id_token) !== flow.nonce) return fail(t("auth.verify"));
    storeTokens(jar, tok);

    let name = "";
    try {
      const d = await customerQuery({ accessToken: tok.access_token, origin, query: "{ customer { firstName } }" });
      name = d.customer?.firstName || "";
    } catch {}
    jar.set(C.name, name || "Cliente", cookieOpts(60 * 60 * 24 * 30));

    return NextResponse.redirect(new URL(safeReturnTo(flow.returnTo), origin));
  } catch (e) {
    return fail(e.message);
  }
}
