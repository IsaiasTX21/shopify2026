export function money({ amount, currencyCode }) {
  return new Intl.NumberFormat(process.env.NEXT_PUBLIC_LOCALE || "pt-BR", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}
