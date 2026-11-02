/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/colecoes/:handle", destination: "/categorias/:handle", permanent: true }];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },
};
export default nextConfig;
