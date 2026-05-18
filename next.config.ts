import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Branded short URLs for our Beacons deal-sheet products.
  // Each entry is a one-line addition. 302 (temporary) so we can swap the
  // destination URL without invalidating any DM links already in the wild.
  // When we reach 5+ deals, migrate this to a Supabase-driven middleware
  // that reads from the deal_keywords table (see PR #2's resolve endpoint).
  async redirects() {
    return [
      {
        source: "/d/aruba",
        destination:
          "https://shop.beacons.ai/vacationpro/8ae28eb6-7b27-41b2-b793-1610183bf1b9",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
