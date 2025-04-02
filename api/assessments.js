import { MongoClient } from 'mongodb';
import { Parser } from 'json2csv';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await MongoClient.connect(MONGODB_URI);
      const db = client.db('mna-assessment');
      const collection = db.collection('assessments');

      const result = await collection.insertOne(req.body);
      await client.close();

      res.status(201).json({ message: 'Assessment saved successfully', id: result.insertedId });
    } catch (error) {
      console.error('Error saving assessment:', error);
      res.status(500).json({ message: 'Error saving assessment' });
    }
  } else if (req.method === 'GET') {
    try {
      const client = await MongoClient.connect(MONGODB_URI);
      const db = client.db('mna-assessment');
      const collection = db.collection('assessments');

      const assessments = await collection.find({}).sort({ createdAt: -1 }).toArray();
      await client.close();

      res.status(200).json(assessments);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      res.status(500).json({ message: 'Error fetching assessments' });
    }
  } else if (req.method === 'GET' && req.query.export === 'true') {
    try {
      const client = await MongoClient.connect(MONGODB_URI);
      const db = client.db('mna-assessment');
      const collection = db.collection('assessments');

      const assessments = await collection.find({}).toArray();
      await client.close();

      // 準備CSV數據
      const fields = [
        'name',
        'gender',
        'dob',
        'totalScore',
        'status',
        'createdAt'
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(assessments);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=mna-assessment-report.csv');
      res.status(200).send(csv);
    } catch (error) {
      console.error('Error exporting assessments:', error);
      res.status(500).json({ message: 'Error exporting assessments' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 