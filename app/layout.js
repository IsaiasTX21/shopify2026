import { Barlow_Condensed, Inter } from "next/font/google";
import { cookies } from "next/headers";
import CartDrawer from "@/components/CartDrawer";
import CartProvider from "@/components/CartProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { accountsEnabled } from "@/lib/customer";
import { getFooter } from "@/lib/footer";
import { readSession } from "@/lib/session";
import { getCart, getCollections } from "@/lib/shopify";
import { site } from "@/site.config";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const cond = Barlow_Condensed({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-cond" });

export const metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: `Compre online em ${site.name}.`,
};

export default async function RootLayout({ children }) {
  const cartId = (await cookies()).get("cartId")?.value;
  const [cart, collections, footer, session] = await Promise.all([
    getCart(cartId).catch(() => null),
    getCollections(12).catch(() => []),
    getFooter().catch(() => ({ columns: [], policies: [], hasHelp: false })),
    readSession(),
  ]);

  // Login: Customer Account API (OAuth), que devolve o cliente para ESTE site.
  // Sem client id configurado, o ícone abre /conta (que explica a configuração) e nunca o tema da Shopify.
  const account = {
    loggedIn: session.loggedIn,
    name: session.name,
    href: session.loggedIn || !accountsEnabled ? "/conta" : "/api/auth/login?returnTo=/conta",
  };

  return (
    <html lang="pt-BR" className={`${body.variable} ${cond.variable}`}>
      <body>
        <CartProvider initialCart={cart}>
          <Header
            name={site.name}
            nav={collections.slice(0, 5)}
            account={account}
            helpHref={footer.hasHelp ? "/pagina/duvidas" : null}
            announcement={site.announcement}
          />
          <main>{children}</main>
          <Footer accountHref={account.href} columns={footer.columns} policies={footer.policies} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
