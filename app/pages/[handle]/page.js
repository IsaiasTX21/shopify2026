import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { getPage } from "@/lib/shopify";
import { site } from "@/site.config";

const contact = site.contact ?? {};
const hasContact = Boolean(contact.email || contact.whatsapp);

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const page = await getPage(handle).catch(() => null);
  return { title: page?.title || (handle === "contact" ? t("page.contact") : t("page.fallback")) };
}

export default async function InfoPage({ params }) {
  const { handle } = await params;
  const page = await getPage(handle).catch(() => null);
  const showContact = handle === "contact" && hasContact;
  if (!page && !showContact) notFound();

  return (
    <article className="wrap page narrow">
      <h1>{page?.title || t("page.contact")}</h1>
      {page && <div className="prose" dangerouslySetInnerHTML={{ __html: page.body }} />}
      {showContact && (
        <div className="contact-box">
          {contact.email && <a className="btn" href={`mailto:${contact.email}`}>{contact.email}</a>}
          {contact.whatsapp && (
            <a className="btn btn-ghost" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          )}
        </div>
      )}
    </article>
  );
}
