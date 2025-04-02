const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const { Parser } = require('json2csv');

// 提交新的評估
router.post('/', async (req, res) => {
  try {
    const assessment = new Assessment(req.body);
    await assessment.save();
    res.status(201).json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 獲取所有評估
router.get('/', async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 導出CSV
router.get('/export', async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    const fields = [
      'name',
      'gender',
      'dob',
      'totalScore',
      'status',
      'createdAt',
      'answers.appetite',
      'answers.weight_change',
      'answers.mobility',
      'answers.medication',
      'answers.pressure_ulcers',
      'answers.meals',
      'answers.dairy',
      'answers.protein',
      'answers.fruits_vegetables',
      'answers.fluid',
      'answers.feeding_mode',
      'answers.self_assessment',
      'answers.health_comparison',
      'answers.ac',
      'answers.cc'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(assessments);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('mna-assessments.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 