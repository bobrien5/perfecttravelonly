import type { NextConfig } from "next";

// Next's own redirect-rule type, so mixing `statusCode` and `permanent`
// entries in one array does not trip TS's union inference.
type RedirectRule = Awaited<
  ReturnType<NonNullable<NextConfig["redirects"]>>
>[number];

// Year-stamped blog slugs that older posts link to but that never existed,
// mapped to the live post (each target verified 200 on 2026-11-10).
export const DEAD_BLOG_SLUG_REDIRECTS: [from: string, to: string][] = [
  ["best-adults-only-all-inclusive-resorts-cancun-2026", "best-adults-only-all-inclusive-resorts"],
  ["best-all-inclusive-honeymoon-resorts-2026", "best-all-inclusive-honeymoon-resorts"],
  ["best-couples-all-inclusive-resorts-2026", "best-couples-all-inclusive-resorts"],
  ["best-all-inclusive-resorts-dominican-republic-2026", "best-all-inclusive-resorts-dominican-republic"],
  ["best-family-all-inclusive-resorts-2026", "best-family-all-inclusive-resorts"],
  ["cheapest-all-inclusive-resorts-2026", "cheapest-all-inclusive-resorts"],
];

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
      // QA 2026-11-09: dead internal links found in live blog posts. There is
      // no /destinations index page, so the bare path goes to the resort
      // catalog. Exact match only: every /destinations/<slug> page is untouched.
      {
        source: "/destinations",
        destination: "/resorts",
        permanent: true,
      },
      // Riviera Maya has no destination page; Cancun is the closest live hub.
      {
        source: "/destinations/riviera-maya",
        destination: "/destinations/cancun",
        permanent: true,
      },
      // Old year-stamped slugs that blog bodies still link to. Explicit pairs
      // rather than a pattern, so only slugs with a confirmed live post move.
      ...DEAD_BLOG_SLUG_REDIRECTS.map(
        ([from, to]): RedirectRule => ({
          source: `/blog/${from}`,
          destination: `/blog/${to}`,
          permanent: true,
        }),
      ),
    ];
    return rules;
  },
};

export default nextConfig;
