const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  productNo: { type: String, required: true },
  productName: { type: String, required: true },
  stockType: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
  department: { type: String, required: true }
});

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
