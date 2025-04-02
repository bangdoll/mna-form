import { MongoClient } from 'mongodb';

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
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 