/** @type {import('next').NextConfig} */
const nextConfig = {
  // 確保 API 路由可以正常工作
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // 其他配置
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig; 