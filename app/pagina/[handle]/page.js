import { notFound } from "next/navigation";
import { getPage } from "@/lib/shopify";
import { site } from "@/site.config";

const contact = site.contact ?? {};
const hasContact = Boolean(contact.email || contact.whatsapp);

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const page = await getPage(handle).catch(() => null);
  return { title: page?.title || (handle === "contato" ? "Fale conosco" : "Página") };
}

export default async function InfoPage({ params }) {
  const { handle } = await params;
  const page = await getPage(handle).catch(() => null);
  const showContact = handle === "contato" && hasContact;
  if (!page && !showContact) notFound();

  return (
    <article className="wrap page narrow">
      <h1>{page?.title || "Fale conosco"}</h1>
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
