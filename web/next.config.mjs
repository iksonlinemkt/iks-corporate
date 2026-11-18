/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['pg', 'sharp'],
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
};
export default nextConfig;
