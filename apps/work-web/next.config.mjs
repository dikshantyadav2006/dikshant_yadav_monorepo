/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@dikshant/ui'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: '**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
