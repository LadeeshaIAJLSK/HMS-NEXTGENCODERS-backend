const mongoose = require('mongoose');

const SalesDataSchema = new mongoose.Schema({
  label: String,
  sales: Number,
  period: {
    type: String,
    enum: ['yearly', 'monthly', 'weekly', 'daily'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sales', SalesDataSchema);