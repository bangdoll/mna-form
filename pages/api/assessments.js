import { MongoClient } from 'mongodb';

// 直接使用連接字符串進行測試
const MONGODB_URI = 'mongodb+srv://bangdoll:mongodb10Kmaway@cluster0.otlnkpp.mongodb.net/mna-assessment?retryWrites=true&w=majority&appName=Cluster0';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async function handler(req, res) {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = await MongoClient.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = client.db('mna-assessment');
    const collection = db.collection('assessments');

    if (req.method === 'POST') {
      const assessmentData = req.body;
      console.log('Received assessment data:', assessmentData);
      
      const result = await collection.insertOne(assessmentData);
      console.log('Inserted assessment:', result);
      
      res.status(201).json({ 
        message: 'Assessment saved successfully', 
        id: result.insertedId 
      });
    } else if (req.method === 'GET') {
      console.log('Fetching assessments...');
      const assessments = await collection.find({}).sort({ createdAt: -1 }).toArray();
      console.log(`Found ${assessments.length} assessments`);

      if (req.query.export === 'true') {
        if (assessments.length === 0) {
          return res.status(404).json({ 
            message: 'No assessments found to export',
            error: 'No data available'
          });
        }

        console.log('Preparing CSV export...');
        
        // 生成 CSV 內容
        const rows = [];
        
        // 添加標題行
        const headers = [
          '姓名',
          '性別',
          '出生日期',
          '總分',
          '營養狀況',
          '評估時間',
          '食慾',
          '體重變化',
          '活動能力',
          '用藥情況',
          '壓傷',
          '餐次',
          '乳製品',
          '蛋白質',
          '蔬果',
          '液體',
          '進食方式',
          '自覺營養狀況',
          '健康比較',
          '上臂圍',
          '小腿圍'
        ];
        
        rows.push(headers.map(header => `"${header}"`).join(','));

        // 添加數據行
        for (const assessment of assessments) {
          const rowData = [
            assessment.name || '',
            assessment.gender === 'male' ? '男' : '女',
            assessment.dob ? new Date(assessment.dob).toLocaleDateString('zh-TW') : '',
            assessment.totalScore || '',
            assessment.status || '',
            assessment.createdAt ? new Date(assessment.createdAt).toLocaleString('zh-TW') : '',
            assessment.answers?.appetite || '',
            assessment.answers?.weight_change || '',
            assessment.answers?.mobility || '',
            assessment.answers?.medication || '',
            assessment.answers?.pressure_ulcers || '',
            assessment.answers?.meals || '',
            assessment.answers?.dairy || '',
            assessment.answers?.protein || '',
            assessment.answers?.fruits_vegetables || '',
            assessment.answers?.fluid || '',
            assessment.answers?.feeding_mode || '',
            assessment.answers?.self_assessment || '',
            assessment.answers?.health_comparison || '',
            assessment.answers?.ac || '',
            assessment.answers?.cc || ''
          ];
          
          rows.push(rowData.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));
        }

        // 生成最終的 CSV 內容
        const BOM = Buffer.from([0xEF, 0xBB, 0xBF]);  // UTF-8 BOM
        const csvContent = rows.join('\n');
        const csvBuffer = Buffer.concat([
          BOM,
          Buffer.from(csvContent, 'utf-8')
        ]);
        
        console.log('CSV generated, size:', csvBuffer.length, 'bytes');
        console.log('First data row:', rows[1]);

        // 設置響應頭
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="mna-assessment-report.csv"');
        res.setHeader('Content-Length', csvBuffer.length);
        
        // 發送響應
        return res.send(csvBuffer);
      } else {
        res.status(200).json(assessments);
      }
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in API:', error);
    res.status(500).json({ 
      message: 'Error processing request',
      error: error.message,
      stack: error.stack
    });
  } finally {
    if (client) {
      await client.close();
      console.log('Closed MongoDB connection');
    }
  }
} 