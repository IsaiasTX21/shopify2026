/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rotas antigas em português continuam funcionando (e o redirecionamento do tema da Shopify também)
  async redirects() {
    return [
      { source: "/produtos/:handle", destination: "/products/:handle", permanent: true },
      { source: "/categorias/:handle", destination: "/collections/:handle", permanent: true },
      { source: "/colecoes/:handle", destination: "/collections/:handle", permanent: true },
      { source: "/carrinho", destination: "/cart", permanent: true },
      { source: "/loja", destination: "/shop", permanent: true },
      { source: "/busca", destination: "/search", permanent: true },
      { source: "/conta", destination: "/account", permanent: true },
      { source: "/pagina/:handle", destination: "/pages/:handle", permanent: true },
      { source: "/politicas/:handle", destination: "/policies/:handle", permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
};
export default nextConfig;
