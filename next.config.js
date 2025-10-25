/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable experimental app directory features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.flowgrid.com'],
    },
  },

  // Image optimization
  images: {
    domains: ['flowgrid.com', 'supabase.co'],
  },

  // Redirects for legacy URLs
  async redirects() {
    return [
      {
        source: '/schedule',
        destination: '/',
        permanent: false,
      },
    ]
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig