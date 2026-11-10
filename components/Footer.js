import Link from "next/link";
import { t } from "@/lib/i18n";
import { site } from "@/site.config";

const A = ({ l }) =>
  l.external ? (
    <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
  ) : (
    <Link href={l.href}>{l.label}</Link>
  );

export default function Footer({ columns = [], policies = [], hasSale = false }) {
  const socials = Object.entries(site.footer.social).filter(([, url]) => url);

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h4>{t("footer.shop")}</h4>
          <ul>
            <li><Link href="/shop?sort=newest">{t("nav.new")}</Link></li>
            <li><Link href="/shop">{t("footer.all")}</Link></li>
            {hasSale && <li><Link href="/sale">{t("nav.sale")}</Link></li>}
            <li><Link href="/cart">{t("cart.title")}</Link></li>
          </ul>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((l) => <li key={l.href + l.label}><A l={l} /></li>)}
            </ul>
          </div>
        ))}
        {socials.length > 0 && (
          <div>
            <h4>{t("footer.social")}</h4>
            <ul>
              {socials.map(([n, url]) => (
                <li key={n}><a href={url} target="_blank" rel="noopener noreferrer" style={{ textTransform: "capitalize" }}>{n}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="footer-base">
        <div className="legal">
          {policies.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </div>
        <p>© {new Date().getFullYear()} {site.name}. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
