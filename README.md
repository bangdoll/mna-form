# MNA迷你營養評估表網站開發教學

本教學將指導您如何建立一個完整的MNA迷你營養評估表網站，包含前端表單和後端數據存儲功能。

## 目錄
1. [專案概述](#專案概述)
2. [技術棧](#技術棧)
3. [開發環境設置](#開發環境設置)
4. [前端開發](#前端開發)
5. [後端開發](#後端開發)
6. [數據庫設置](#數據庫設置)
7. [部署流程](#部署流程)
8. [測試與維護](#測試與維護)

## 專案概述

MNA迷你營養評估表是一個用於評估老年人營養狀況的工具。本專案將建立一個網頁應用程序，允許用戶：
- 填寫評估表單
- 即時計算評估分數
- 獲取營養狀況建議
- 保存評估結果
- 導出評估數據

## 技術棧

- 前端：
  - HTML5
  - CSS3
  - JavaScript (ES6+)
- 後端：
  - Node.js
  - Express.js
  - MongoDB
- 部署平台：
  - Vercel
  - MongoDB Atlas

## 開發環境設置

1. 安裝必要工具：
   ```bash
   # 安裝 Node.js
   # 從 https://nodejs.org 下載並安裝

   # 安裝 Git
   # 從 https://git-scm.com 下載並安裝
   ```

2. 創建專案目錄：
   ```bash
   mkdir mna-form
   cd mna-form
   ```

3. 初始化 Git 倉庫：
   ```bash
   git init
   ```

4. 創建 .gitignore 文件：
   ```
   node_modules/
   .env
   ```

## 前端開發

1. 創建 index.html：
   ```html
   <!DOCTYPE html>
   <html lang="zh-Hant">
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>MNA迷你營養評估表</title>
     <!-- 添加樣式和腳本 -->
   </head>
   <body>
     <!-- 添加表單內容 -->
   </body>
   </html>
   ```

2. 添加樣式：
   - 使用 CSS 美化表單
   - 實現響應式設計
   - 添加結果顯示區域

3. 添加 JavaScript 功能：
   - 表單驗證
   - 分數計算
   - API 調用
   - 結果顯示

## 後端開發

1. 創建 API 目錄：
   ```bash
   mkdir -p api
   ```

2. 創建 API 路由文件 (api/assessments.js)：
   ```javascript
   import { MongoClient } from 'mongodb';

   const MONGODB_URI = process.env.MONGODB_URI;

   export default async function handler(req, res) {
     // 處理 POST 和 GET 請求
   }
   ```

3. 配置 package.json：
   ```json
   {
     "name": "mna-assessment",
     "version": "1.0.0",
     "dependencies": {
       "vercel": "^33.5.1",
       "mongodb": "^6.3.0"
     }
   }
   ```

## 數據庫設置

1. 創建 MongoDB Atlas 帳號：
   - 訪問 https://www.mongodb.com/cloud/atlas
   - 註冊免費帳號
   - 創建新集群

2. 配置數據庫：
   - 創建數據庫用戶
   - 設置網絡訪問
   - 獲取連接字符串

3. 設置環境變量：
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/mna-assessment
   ```

## 部署流程

1. 部署到 Vercel：
   - 安裝 Vercel CLI：`npm i -g vercel`
   - 登錄 Vercel：`vercel login`
   - 部署專案：`vercel`

2. 配置環境變量：
   - 在 Vercel 儀表板中設置 MONGODB_URI
   - 重新部署專案

3. 設置自動部署：
   - 連接 GitHub 倉庫
   - 配置部署設置

## 測試與維護

1. 測試功能：
   - 表單提交
   - 數據保存
   - 結果顯示
   - 數據導出

2. 監控與維護：
   - 檢查錯誤日誌
   - 監控數據庫使用情況
   - 定期備份數據

## 注意事項

1. 安全性考慮：
   - 使用環境變量存儲敏感信息
   - 實現適當的數據驗證
   - 設置適當的訪問控制

2. 性能優化：
   - 優化數據庫查詢
   - 實現適當的緩存策略
   - 優化前端資源加載

3. 用戶體驗：
   - 提供清晰的錯誤提示
   - 實現適當的表單驗證
   - 優化移動端顯示

## 參考資源

- [MongoDB Atlas 文檔](https://docs.atlas.mongodb.com/)
- [Vercel 文檔](https://vercel.com/docs)
- [MNA 評估指南](https://www.mna-elderly.com/) 