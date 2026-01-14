import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// next-intl 4.x 配置
// 使用 requestConfig 选项指定配置文件路径
const withNextIntl = createNextIntlPlugin({
  requestConfig: './i18n/request.ts'
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 本地图片不需要 remotePatterns 配置
  // Next.js Image 组件会自动优化和缓存本地图片
};

export default withNextIntl(nextConfig);
