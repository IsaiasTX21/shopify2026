import { notFound } from "next/navigation";
import { t } from "@/lib/i18n";
import { getPolicy } from "@/lib/shopify";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const p = await getPolicy(handle).catch(() => null);
  return { title: p?.title || t("policy.fallback") };
}

export default async function PolicyPage({ params }) {
  const { handle } = await params;
  const policy = await getPolicy(handle);
  if (!policy) notFound();
  return (
    <article className="wrap page narrow">
      <h1>{policy.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: policy.body }} />
    </article>
  );
}
