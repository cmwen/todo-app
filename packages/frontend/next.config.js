/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@todo-app/shared'],
  experimental: {
    esmExternals: true,
  },
  env: {
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
  },
};

export default nextConfig;
