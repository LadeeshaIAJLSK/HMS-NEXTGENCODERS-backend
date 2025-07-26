const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
