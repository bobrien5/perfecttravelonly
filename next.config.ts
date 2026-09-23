import type { NextConfig } from "next";

// Next's own redirect-rule type, so mixing `statusCode` and `permanent`
// entries in one array does not trip TS's union inference.
type RedirectRule = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

const nextConfig: NextConfig = {
  transpilePackages: ["@vacationpro/engine"],
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
      // Destinations retired 2026-09-22. These five existed to feed the
      // Tristar timeshare lead funnel, which ended, so they no longer fit a
      // Caribbean and Mexico site. All five were live and in the sitemap, so
      // they redirect rather than 404.
      //
      // Hawaii, Maui and Vegas point at the surviving article on that place,
      // which keeps their link equity flowing to live content instead of
      // dumping it on a hub page. Miami and Orlando have no equivalent
      // article, so they fall back to the destinations index.
      {
        source: "/destinations/hawaii",
        destination: "/blog/does-hawaii-have-all-inclusive-resorts",
        permanent: true,
      },
      {
        source: "/destinations/maui",
        destination: "/blog/best-time-to-visit-maui",
        permanent: true,
      },
      {
        source: "/destinations/las-vegas",
        destination: "/blog/best-time-to-visit-las-vegas",
        permanent: true,
      },
      {
        source: "/destinations/miami",
        destination: "/blog",
        permanent: true,
      },
      // Jamaica split into Montego Bay and Negril on 2026-09-22, matching the
      // match engine, which has always treated them separately: they differ
      // sharply on transfer time (25 minutes vs 90) and on character. The
      // combined page was live and indexed, so it redirects to Montego Bay,
      // which is the island's main gateway and the closer match for the
      // generic "Jamaica vacation" intent the old page ranked for.
      {
        source: "/destinations/jamaica",
        destination: "/destinations/jamaica-montego-bay",
        permanent: true,
      },
      {
        source: "/destinations/orlando",
        destination: "/blog",
        permanent: true,
      },
    ];
    return rules;
  },
};

export default nextConfig;
