import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js runs on port 3000 behind Nginx
  // Nginx handles routing: /blog/* → WordPress, everything else → Next.js
  // No rewrites needed — Nginx is the reverse proxy
};

export default nextConfig;
