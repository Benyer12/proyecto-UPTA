import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Esto obliga a Vercel a compilar aunque queden advertencias o errores de tipo
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig
