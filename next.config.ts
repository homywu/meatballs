import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// next-intl 4.x 配置
// 使用 requestConfig 选项指定配置文件路径
const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts'
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    // Enable image caching and optimization
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  // Add cache headers for static assets
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*\\.(png|jpg|jpeg|gif|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
