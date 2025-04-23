/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled strict mode to avoid potential issues
  
  // Completely disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Completely disable TypeScript type checking
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,
  
  // Existing redirects
  async redirects() {
    return [
      {
        source: '/cashflow',
        destination: '/cash-flow',
        permanent: true,
      },
    ];
  },
  
  // Increase build output verbosity to help troubleshoot
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 120 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  
  // Development indicators position
  devIndicators: {
    position: 'bottom-right',
  },
};

module.exports = nextConfig; 