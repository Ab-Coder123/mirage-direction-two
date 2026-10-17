import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mirage/ui', '@mirage/utils', '@mirage/types', '@mirage/config'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
