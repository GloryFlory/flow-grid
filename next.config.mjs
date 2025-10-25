/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    turbo: {
      useSwcCss: true,
    },
  },
  
  // Optimize bundle splitting
  webpack: (config, { dev, isServer }) => {
    // Optimize for faster development builds
    if (dev && !isServer) {
      config.devtool = 'eval-cheap-module-source-map'
    }
    
    return config
  },
  
  // Reduce compilation overhead
  swcMinify: true,
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rfpoqcliiduvotlfzopv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Replace these with your actual domains
          { key: "Content-Security-Policy", value: "frame-ancestors https://YOUR-SQUARESPACE-DOMAIN.squarespace.com https://YOUR-CUSTOM-DOMAIN.com;" }
        ]
      }
    ];
  }
};
export default nextConfig;