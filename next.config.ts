import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.eu-central-003.backblazeb2.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
