import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true, // atau false untuk redirect sementara
      },
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb', // Set your desired limit here
    },
  },
};

export default nextConfig;
