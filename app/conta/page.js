import Image from "next/image";
import { redirect } from "next/navigation";
import { accountsEnabled, customerQuery } from "@/lib/customer";
import { money } from "@/lib/format";
import { getOrigin, readSession } from "@/lib/session";

export const metadata = { title: "Minha conta" };

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

const PAY = {
  PAID: "Pago", PENDING: "Pagamento pendente", AUTHORIZED: "Autorizado", PARTIALLY_PAID: "Parcialmente pago",
  REFUNDED: "Reembolsado", PARTIALLY_REFUNDED: "Parcialmente reembolsado", VOIDED: "Cancelado", EXPIRED: "Expirado",
};
const SHIP = { SUCCESS: "Enviado", IN_PROGRESS: "Em andamento", OPEN: "Em preparação", CANCELLED: "Envio cancelado", FAILURE: "Falha no envio" };

export default async function Account({ searchParams }) {
  const sp = await searchParams;

  if (sp.erro) {
    return (
      <section className="wrap page empty">
        <h1>Não foi possível entrar</h1>
        <p className="alert" role="alert">{sp.erro}</p>
        <a className="btn" href="/api/auth/login?returnTo=/conta">Tentar novamente</a>
      </section>
    );
  }

  if (!accountsEnabled) {
    return (
      <section className="wrap page narrow">
        <h1>Login de clientes ainda não configurado</h1>
        <p className="muted">
          Para o cliente entrar e voltar para este site (e não para o tema padrão da Shopify), ative a Customer Account API:
        </p>
        <ol className="prose" style={{ paddingLeft: "1.2rem", marginTop: "1rem" }}>
          <li>Shopify → app Headless → seu storefront → Customer Account API.</li>
          <li>Copie o Client ID para <code>SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID</code> no <code>.env.local</code>.</li>
          <li>Cadastre o Callback URI <code>http://localhost:3000/api/auth/callback</code>, o JavaScript origin e o Logout URI <code>http://localhost:3000</code>.</li>
          <li>Reinicie o <code>npm run dev</code>.</li>
        </ol>
      </section>
    );
  }

  const s = await readSession();
  if (!s.loggedIn) redirect("/api/auth/login?returnTo=/conta");
  if (!s.access) redirect("/api/auth/refresh?returnTo=/conta");

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
  if (expired && !sp.r) redirect("/api/auth/refresh?returnTo=/conta%3Fr%3D1");
  if (expired) error = "Sua sessão expirou. Entre novamente.";

  if (error || !customer) {
    return (
      <section className="wrap page empty">
        <h1>Minha conta</h1>
        <p className="alert" role="alert">{error || "Não foi possível carregar sua conta."}</p>
        <a className="btn" href="/api/auth/logout">Sair e entrar de novo</a>
      </section>
    );
  }

  const orders = customer.orders?.nodes ?? [];
  const date = new Intl.DateTimeFormat(process.env.NEXT_PUBLIC_LOCALE || "pt-BR", { dateStyle: "medium" });

  return (
    <section className="wrap page account">
      <header className="account-head">
        <div>
          <h1>Olá, {customer.firstName || "cliente"}</h1>
          <p className="muted">{customer.emailAddress?.emailAddress}</p>
        </div>
        <a className="btn btn-ghost" href="/api/auth/logout">Sair</a>
      </header>

      <h2 className="account-h">Meus pedidos</h2>
      {orders.length === 0 ? (
        <p className="empty-note">Você ainda não fez nenhum pedido.</p>
      ) : (
        <ul className="orders">
          {orders.map((o) => {
            const ful = o.fulfillments?.nodes ?? [];
            const shipLabel = ful.length ? ful.map((f) => SHIP[f.status] || f.status).join(", ") : "Em preparação";
            const tracking = ful.flatMap((f) => f.trackingInformation ?? []);
            return (
              <li className="order" key={o.id}>
                <div className="order-top">
                  <div>
                    <strong>Pedido {o.name}</strong>
                    <span className="muted"> · {date.format(new Date(o.processedAt))}</span>
                  </div>
                  <strong>{money(o.totalPrice)}</strong>
                </div>
                <p className="chips-row">
                  <span className="chip">{PAY[o.financialStatus] || o.financialStatus}</span>
                  <span className="chip">{shipLabel}</span>
                </p>
                <ul className="order-items">
                  {o.lineItems.nodes.map((li, i) => (
                    <li key={i}>
                      <div className="oi-img">{li.image && <Image src={li.image.url} alt={li.image.altText || li.title} fill sizes="56px" />}</div>
                      <div>
                        <p>{li.title}</p>
                        <p className="muted">{[li.variantTitle, `Qtd: ${li.quantity}`].filter(Boolean).join(" · ")}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="order-links">
                  {o.statusPageUrl && <a className="underline" href={o.statusPageUrl} target="_blank" rel="noopener noreferrer">Ver status do pedido</a>}
                  {tracking.filter((t) => t.url).map((t) => (
                    <a key={t.number} className="underline" href={t.url} target="_blank" rel="noopener noreferrer">Rastrear {t.number}</a>
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
