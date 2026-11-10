import Image from "next/image";
import { redirect } from "next/navigation";
import { accountsEnabled, customerQuery } from "@/lib/customer";
import { money } from "@/lib/format";
import { locale, t } from "@/lib/i18n";
import { getOrigin, readSession } from "@/lib/session";

export const metadata = { title: t("account.title") };

const QUERY = `{
  customer {
    firstName lastName
    emailAddress { emailAddress }
    orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
      nodes {
        id name processedAt financialStatus statusPageUrl
        totalPrice { amount currencyCode }
        fulfillments(first: 5) { nodes { status trackingInformation { number url company } } }
        lineItems(first: 10) { nodes { title quantity variantTitle image { url altText } } }
      }
    }
  }
}`;

// Rótulo traduzido; se o status for desconhecido, mostra o valor original
const label = (prefix, v) => {
  const k = `${prefix}.${v}`;
  const s = t(k);
  return s === k ? v : s;
};

export default async function Account({ searchParams }) {
  const sp = await searchParams;

  if (sp.error) {
    return (
      <section className="wrap page empty">
        <h1>{t("account.signInFailed")}</h1>
        <p className="alert" role="alert">{sp.error}</p>
        <a className="btn" href="/api/auth/login?returnTo=/account">{t("account.tryAgain")}</a>
      </section>
    );
  }

  if (!accountsEnabled) {
    return (
      <section className="wrap page narrow">
        <h1>{t("account.notConfigured")}</h1>
        <p className="muted">{t("account.notConfiguredText")}</p>
        <ol className="prose" style={{ paddingLeft: "1.2rem", marginTop: "1rem" }}>
          <li>{t("account.step1")}</li>
          <li>{t("account.step2", { var: "SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID" })}</li>
          <li>{t("account.step3", { cb: "https://YOUR-DOMAIN/api/auth/callback" })}</li>
          <li>{t("account.step4")}</li>
        </ol>
      </section>
    );
  }

  const s = await readSession();
  if (!s.loggedIn) redirect("/api/auth/login?returnTo=/account");
  if (!s.access) redirect("/api/auth/refresh?returnTo=/account");

  let customer = null;
  let error = "";
  let expired = false;
  try {
    const data = await customerQuery({ accessToken: s.access, origin: await getOrigin(), query: QUERY });
    customer = data.customer;
  } catch (e) {
    if (e.status === 401) expired = true;
    else error = e.message;
  }
  if (expired && !sp.r) redirect("/api/auth/refresh?returnTo=/account%3Fr%3D1");
  if (expired) error = t("account.sessionExpired");

  if (error || !customer) {
    return (
      <section className="wrap page empty">
        <h1>{t("account.title")}</h1>
        <p className="alert" role="alert">{error || t("account.loadFailed")}</p>
        <a className="btn" href="/api/auth/logout">{t("account.signOutAgain")}</a>
      </section>
    );
  }

  const orders = customer.orders?.nodes ?? [];
  const date = new Intl.DateTimeFormat(locale(), { dateStyle: "medium" });

  return (
    <section className="wrap page account">
      <header className="account-head">
        <div>
          <h1>{t("account.hello", { name: customer.firstName || t("account.guest") })}</h1>
          <p className="muted">{customer.emailAddress?.emailAddress}</p>
        </div>
        <a className="btn btn-ghost" href="/api/auth/logout">{t("account.signOut")}</a>
      </header>

      <h2 className="account-h">{t("account.orders")}</h2>
      {orders.length === 0 ? (
        <p className="empty-note">{t("account.noOrders")}</p>
      ) : (
        <ul className="orders">
          {orders.map((o) => {
            const ful = o.fulfillments?.nodes ?? [];
            const shipLabel = ful.length ? ful.map((f) => label("ship", f.status)).join(", ") : t("ship.none");
            const tracking = ful.flatMap((f) => f.trackingInformation ?? []);
            return (
              <li className="order" key={o.id}>
                <div className="order-top">
                  <div>
                    <strong>{t("account.order", { name: o.name })}</strong>
                    <span className="muted"> · {date.format(new Date(o.processedAt))}</span>
                  </div>
                  <strong>{money(o.totalPrice)}</strong>
                </div>
                <p className="chips-row">
                  <span className="chip">{label("pay", o.financialStatus)}</span>
                  <span className="chip">{shipLabel}</span>
                </p>
                <ul className="order-items">
                  {o.lineItems.nodes.map((li, i) => (
                    <li key={i}>
                      <div className="oi-img">{li.image && <Image src={li.image.url} alt={li.image.altText || li.title} fill sizes="56px" />}</div>
                      <div>
                        <p>{li.title}</p>
                        <p className="muted">{[li.variantTitle, t("account.qty", { n: li.quantity })].filter(Boolean).join(" · ")}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="order-links">
                  {o.statusPageUrl && <a className="underline" href={o.statusPageUrl} target="_blank" rel="noopener noreferrer">{t("account.viewStatus")}</a>}
                  {tracking.filter((x) => x.url).map((x) => (
                    <a key={x.number} className="underline" href={x.url} target="_blank" rel="noopener noreferrer">{t("account.track", { n: x.number })}</a>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
