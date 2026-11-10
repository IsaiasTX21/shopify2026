import { locale } from "./i18n";

export function money({ amount, currencyCode }) {
  return new Intl.NumberFormat(locale(), { style: "currency", currency: currencyCode }).format(Number(amount));
}
