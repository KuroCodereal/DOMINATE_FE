// import type { NextConfig } from 'next'

// const nextConfig: NextConfig = {
//   output: 'standalone',
//   compiler: {
//     styledComponents: true,
//   },
//   sassOptions: { quietDeps: true },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   skipTrailingSlashRedirect: true,
//   devIndicators: false,

//   images: {
//     domains: [
//       'cdn.pixabay.com',
//       'server-dominate.onrender.com',
//       'static.vecteezy.com'
//     ],
//   },

//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: `${process.env.NEXT_PUBLIC_BASE_API_URL}/:path*`,
//       },
//     ]
//   },

//   // Nếu cần redirect trang chủ từ /
//   // async redirects() {
//   //   return [
//   //     {
//   //       source: '/',
//   //       destination: process.env.REDIRECT_HOME || '/',
//   //       permanent: true,
//   //     },
//   //   ]
//   // },
// }

// export default nextConfig

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  compiler: {
    styledComponents: true,
  },
  sassOptions: { quietDeps: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  skipTrailingSlashRedirect: true,
  devIndicators: false,
  images: {
    domains: [
      'cdn.pixabay.com',
      'server-dominate.onrender.com', 
      'static.vecteezy.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: 'api/:path*',
        destination: 'https://server-dominate.onrender.com/api/v1/:path*',
      },
    ]
  }
}

export default nextConfig
