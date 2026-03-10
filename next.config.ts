import type { NextConfig } from "next";

// WordPress on DigitalOcean droplet, Next.js on Vercel
// Vercel rewrites proxy /blog/* traffic to WordPress
const WORDPRESS_URL = process.env.WORDPRESS_URL || 'https://blog.vacationpro.co';

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        // Proxy /blog to WordPress
        {
          source: '/blog',
          destination: `${WORDPRESS_URL}/blog`,
        },
        {
          source: '/blog/:path*',
          destination: `${WORDPRESS_URL}/blog/:path*`,
        },
        // WordPress assets (themes, uploads, plugins)
        {
          source: '/wp-content/:path*',
          destination: `${WORDPRESS_URL}/wp-content/:path*`,
        },
        {
          source: '/wp-includes/:path*',
          destination: `${WORDPRESS_URL}/wp-includes/:path*`,
        },
        // WordPress admin
        {
          source: '/wp-admin/:path*',
          destination: `${WORDPRESS_URL}/wp-admin/:path*`,
        },
        {
          source: '/wp-login.php',
          destination: `${WORDPRESS_URL}/wp-login.php`,
        },
        // WordPress REST API (for blog previews on Next.js pages)
        {
          source: '/wp-json/:path*',
          destination: `${WORDPRESS_URL}/wp-json/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
