import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Firebase Hosting
  output: "export",

  // Optimize images
  images: {
    unoptimized: true, // Required for static export
  },

  // Enable compression
  compress: true,

  // Performance optimizations
  poweredByHeader: false,

  // Use turbopack (Next 16 default) with empty config to silence conflict warning
  turbopack: {},

  // React strict mode for development
  reactStrictMode: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },
};

export default nextConfig;
