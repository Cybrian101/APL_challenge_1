import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  compress: true,

  poweredByHeader: false,

  reactStrictMode: true,

  turbopack: {},

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "react-icons",
    ],
  },

  env: {
    NEXT_PUBLIC_APP_VERSION: "1.0.0",
  },
};

export default nextConfig;  