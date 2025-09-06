/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [],
  },
};
// intentionally empty to avoid ESM config; using next.config.js (CJS)
export default nextConfig;
