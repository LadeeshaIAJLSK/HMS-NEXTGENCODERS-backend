const mongoose = require('mongoose');

const kitchenOrderSchema = new mongoose.Schema({
  item: String,
  quantity: Number,
  status: {
    type: String,
    enum: ['Pending', 'Ready', 'Completed'],
    default: 'Pending',
  },
});

module.exports = mongoose.model('KitchenOrder', kitchenOrderSchema);
