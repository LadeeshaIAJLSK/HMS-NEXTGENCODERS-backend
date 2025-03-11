const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;