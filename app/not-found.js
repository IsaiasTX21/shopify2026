import Link from "next/link";
export default function NotFound() {
  return (
    <section className="wrap page empty">
      <h1>Página não encontrada</h1>
      <p className="muted">O conteúdo pode ter sido removido ou ainda não foi criado no painel da Shopify.</p>
      <Link href="/" className="btn">Voltar para a loja</Link>
    </section>
  );
}
