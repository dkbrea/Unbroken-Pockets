/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // For redirects
  async redirects() {
    return [
      {
        source: '/cashflow',
        destination: '/cash-flow',
        permanent: true,
      },
    ];
  },
}

export default nextConfig; 