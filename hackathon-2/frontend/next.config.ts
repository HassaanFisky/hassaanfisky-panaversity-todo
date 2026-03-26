import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",          // required for Docker / Koyeb
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
