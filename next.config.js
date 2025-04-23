/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/cashflow',
        destination: '/cash-flow',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig; 