import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Required for Server Actions in Next.js 15
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Googleddd profile images
      },
    ],
  },
};

export default nextConfig;
