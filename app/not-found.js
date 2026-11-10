import Link from "next/link";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <section className="wrap page empty">
      <h1>{t("notFound.title")}</h1>
      <p className="muted">{t("notFound.text")}</p>
      <Link href="/" className="btn">{t("notFound.back")}</Link>
    </section>
  );
}
