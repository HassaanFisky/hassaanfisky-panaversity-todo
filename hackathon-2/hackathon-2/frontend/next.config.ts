import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Fix for monorepo root detection issue blocking build */
  outputFileTracingRoot: path.join(__dirname, "../../../"),
  typescript: {
    // Standardizing type checks for production safety
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
