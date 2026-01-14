import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 本地图片不需要 remotePatterns 配置
  // Next.js Image 组件会自动优化和缓存本地图片
};

export default nextConfig;
