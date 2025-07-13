const Stock = require("../models/StockModels");

exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ date: -1 });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createStock = async (req, res) => {
  try {
    console.log("🔥 Incoming POST data:", req.body);

    const newStock = new Stock(req.body);
    const savedStock = await newStock.save();

    res.status(201).json(savedStock);
  } catch (err) {
    console.error("❌ Create Stock Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const updated = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Stock not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteStock = async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
