import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // This is to allow the Next.js dev server to accept requests from the
  // Firebase Studio development environment.
  allowedDevOrigins: [
    '6000-firebase-studio-1764342441461.cluster-52r6vzs3ujeoctkkxpjif3x34a.cloudworkstations.dev',
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/microcopy.json',
        destination: '/src/lib/microcopy.json',
      },
    ]
  },
};

export default nextConfig;
