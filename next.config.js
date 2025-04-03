/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 啟用靜態輸出
  distDir: 'public', // 設置輸出目錄為 public
  images: {
    unoptimized: true // 靜態輸出需要禁用圖片優化
  }
};

module.exports = nextConfig; 