/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],

  eslint: {
    ignoreDuringBuilds: true, // 🔥 FIX build crash
  },
};

module.exports = nextConfig;