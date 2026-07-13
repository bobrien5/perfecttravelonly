import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Branded short URLs for our paid guide products (now on Beehiiv, Stripe).
  // 302 (temporary) so the destination can swap again without invalidating
  // any DM links already in the wild. When we reach 5+ guides, migrate this
  // to a Supabase-driven middleware that reads from the deal_keywords table
  // (see PR #2's resolve endpoint).
  async redirects() {
    return [
      {
        source: "/d/aruba",
        destination:
          "https://www.perfecttravelonly.com/products/aruba-beach-getaway-guide",
        permanent: false,
      },
      {
        source: "/d/puntacana",
        destination:
          "https://www.perfecttravelonly.com/products/excellence-punta-cana-guide",
        permanent: false,
      },
      {
        source: "/deals/:category/:slug",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/deals/:category",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/deals/:path*",
        destination: "/destinations",
        permanent: true,
      },
      {
        source: "/deals",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
