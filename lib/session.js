import { cookies, headers } from "next/headers";

export const C = { flow: "ca_flow", access: "ca_access", refresh: "ca_refresh", id: "ca_id", name: "ca_name" };

export const cookieOpts = (maxAge) => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

// Só aceita caminhos internos (evita open redirect)
export function safeReturnTo(v, fallback = "/account") {
  return typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

export function originFromHeaders(h) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}
export async function getOrigin() {
  return originFromHeaders(await headers());
}

export async function readSession() {
  const jar = await cookies();
  const access = jar.get(C.access)?.value;
  const refresh = jar.get(C.refresh)?.value;
  return {
    loggedIn: Boolean(access || refresh),
    access,
    refresh,
    idToken: jar.get(C.id)?.value,
    name: jar.get(C.name)?.value ?? "",
  };
}

export function storeTokens(jar, t) {
  jar.set(C.access, t.access_token, cookieOpts(Math.max(60, (t.expires_in ?? 3600) - 30)));
  if (t.refresh_token) jar.set(C.refresh, t.refresh_token, cookieOpts(60 * 60 * 24 * 30));
  if (t.id_token) jar.set(C.id, t.id_token, cookieOpts(60 * 60 * 24 * 30));
}

export function clearSession(jar) {
  Object.values(C).forEach((n) => jar.delete(n));
}
