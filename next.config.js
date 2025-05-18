/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Completely disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Completely disable TypeScript type checking
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Use the default output directory instead of custom one
  // distDir is removed to use default

  // Only include basic settings
  experimental: {
    forceSwcTransforms: true,
  },

  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
  
  // Removed the redirect to /unbroken-pockets-landing.html
};

module.exports = nextConfig; 