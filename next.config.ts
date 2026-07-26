import type { NextConfig } from "next";

// Next's own redirect-rule type, so mixing `statusCode` and `permanent`
// entries in one array does not trip TS's union inference.
type RedirectRule = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

const nextConfig: NextConfig = {
  // Branded short URLs for our paid guide products (now on Beehiiv, Stripe).
  // 302 (temporary) so the destination can swap again without invalidating
  // any DM links already in the wild. When we reach 5+ guides, migrate this
  // to a Supabase-driven middleware that reads from the deal_keywords table
  // (see PR #2's resolve endpoint).
  async redirects() {
    const rules: RedirectRule[] = [
      {
        // ads.txt is managed by Mediavine/Journey. 301 (not Next's default 308)
        // for IAB ads.txt crawler compatibility. Never edit ads.txt by hand;
        // the partner list updates at the destination automatically.
        source: "/ads.txt",
        destination:
          "https://adstxt.journeymv.com/sites/e826f3a3-1424-4081-9650-1fad60b84735/ads.txt",
        statusCode: 301,
      },
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
    return rules;
  },
};

export default nextConfig;
