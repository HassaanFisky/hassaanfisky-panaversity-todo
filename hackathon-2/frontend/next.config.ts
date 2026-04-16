import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Removed outputFileTracingRoot for Vercel production compatibility */
  typescript: {
    // Standardizing type checks for production safety
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
