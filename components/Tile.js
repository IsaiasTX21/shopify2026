import Image from "next/image";
import Link from "next/link";
import { t } from "@/lib/i18n";

// size: "large" (título + botão), "tall" (apenas rótulo em pílula)
export default function Tile({ href, title, subtitle, image, size = "large", cta = t("common.shop") }) {
  return (
    <Link href={href} className={`tile tile-${size}`}>
      {image && (
        <Image
          src={image.url}
          alt={image.altText || ""}
          fill
          sizes={size === "large" ? "(max-width: 700px) 100vw, 50vw" : "(max-width: 700px) 100vw, 400px"}
        />
      )}
      <div className="tile-copy">
        {size === "large" ? (
          <>
            {subtitle && <p>{subtitle}</p>}
            <h3 className="cap">{title}</h3>
            <span className="pill pill-lg">{cta}</span>
          </>
        ) : (
          <span className="pill cap">{title}</span>
        )}
      </div>
    </Link>
  );
}
