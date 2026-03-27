/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from backend (if needed)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
