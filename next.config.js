/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 啟用靜態輸出
  images: {
    unoptimized: true // 靜態輸出需要禁用圖片優化
  }
};

module.exports = nextConfig; 