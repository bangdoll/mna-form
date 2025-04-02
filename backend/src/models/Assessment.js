const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female']
  },
  dob: {
    type: Date,
    required: true
  },
  answers: {
    appetite: Number,
    weight_change: Number,
    mobility: Number,
    medication: Number,
    pressure_ulcers: Number,
    meals: Number,
    dairy: Number,
    protein: Number,
    fruits_vegetables: Number,
    fluid: Number,
    feeding_mode: Number,
    self_assessment: Number,
    health_comparison: Number,
    ac: Number,
    cc: Number
  },
  totalScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['營養不良', '有營養不良風險', '營養狀況良好']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema); 