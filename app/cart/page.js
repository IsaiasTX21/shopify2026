import CartView from "@/components/CartView";
import { t } from "@/lib/i18n";

export const metadata = { title: t("cart.meta") };

export default function CartPage() {
  return <div className="wrap page"><CartView /></div>;
}
