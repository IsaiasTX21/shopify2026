import crypto from "node:crypto";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
export const CLIENT_ID = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
export const accountsEnabled = Boolean(CLIENT_ID);

const b64url = (b) => Buffer.from(b).toString("base64url");

// Endereços de login/token/API da própria loja (descoberta automática)
export async function discover() {
  const get = (path) =>
    fetch(`https://${domain}${path}`, { next: { revalidate: 3600 } }).then((r) => {
      if (!r.ok) throw new Error(`${path} respondeu ${r.status}. Contas de clientes novas estão ativas?`);
      return r.json();
    });
  const [oidc, api] = await Promise.all([get("/.well-known/openid-configuration"), get("/.well-known/customer-account-api")]);
  return { authorize: oidc.authorization_endpoint, token: oidc.token_endpoint, logout: oidc.end_session_endpoint, graphql: api.graphql_api };
}

export function pkce() {
  const verifier = b64url(crypto.randomBytes(32));
  return {
    verifier,
    challenge: b64url(crypto.createHash("sha256").update(verifier).digest()),
    state: b64url(crypto.randomBytes(16)),
    nonce: b64url(crypto.randomBytes(16)),
  };
}

export async function buildAuthorizeUrl({ origin, challenge, state, nonce }) {
  const { authorize } = await discover();
  const u = new URL(authorize);
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email customer-account-api:full");
  u.searchParams.set("redirect_uri", `${origin}/api/auth/callback`);
  u.searchParams.set("state", state);
  u.searchParams.set("nonce", nonce);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");
  return u.toString();
}

async function tokenRequest(origin, params) {
  const { token } = await discover();
  const res = await fetch(token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: origin },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...params }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error_description || json.error || `Falha ao autenticar (${res.status})`);
  return json;
}

export const exchangeCode = ({ origin, code, verifier }) =>
  tokenRequest(origin, {
    grant_type: "authorization_code",
    redirect_uri: `${origin}/api/auth/callback`,
    code,
    code_verifier: verifier,
  });

export const refreshTokens = ({ origin, refreshToken }) =>
  tokenRequest(origin, { grant_type: "refresh_token", refresh_token: refreshToken });

export function jwtNonce(idToken) {
  try { return JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString()).nonce; } catch { return null; }
}

export async function customerQuery({ accessToken, origin, query, variables = {} }) {
  const { graphql } = await discover();
  const res = await fetch(graphql, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: accessToken, Origin: origin },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    const e = new Error("Sessão expirada");
    e.status = 401;
    throw e;
  }
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}
