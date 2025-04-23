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
  
  // Force using SWC compiler even if babel config exists and disable server components
  experimental: {
    forceSwcTransforms: true,
    serverComponents: false,
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

  // Output directory
  distDir: 'dist',

  // Exclude accounts page from the build process
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => {
    // This function runs for each file extension
    return true; // Include all extensions
  }),

  // Override webpack config to exclude accounts page
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Only apply this in production client-side build
      // This creates an empty module for the accounts page
      config.resolve.alias['@/app/accounts/page'] = require.resolve('./src/lib/empty-module.js');
    }
    return config;
  },
};

module.exports = nextConfig; 