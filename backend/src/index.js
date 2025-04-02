require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const assessmentsRouter = require('./routes/assessments');

const app = express();

// 連接數據庫
connectDB();

// 中間件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/assessments', assessmentsRouter);

// 錯誤處理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 