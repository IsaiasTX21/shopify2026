import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { refreshTokens } from "@/lib/customer";
import { C, clearSession, originFromHeaders, safeReturnTo, storeTokens } from "@/lib/session";

export async function GET(request) {
  const origin = originFromHeaders(request.headers);
  const returnTo = safeReturnTo(new URL(request.url).searchParams.get("returnTo"));
  const jar = await cookies();
  const refreshToken = jar.get(C.refresh)?.value;
  const login = () => NextResponse.redirect(new URL(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`, origin));

  if (!refreshToken) return login();
  try {
    storeTokens(jar, await refreshTokens({ origin, refreshToken }));
    return NextResponse.redirect(new URL(returnTo, origin));
  } catch {
    clearSession(jar);
    return login();
  }
}
