// models/transactionModel.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  activity: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    enum: ["Restaurant", "Reception", "Kitchen", "HouseKeeping", "Management"],
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["Income", "Expense"],
    required: true,
  },
  paymentMode: {
    type: String,
    enum: ["Cash", "Credit Card", "Debit Card", "Mobile Wallet", "Cheque", "Bank Transfer"],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
