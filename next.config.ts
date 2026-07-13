import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Move ignoreBuildErrors under the `typescript` namespace to match Next.js config shape
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
