const mongoose = require("mongoose");

const DashboardSchema = new mongoose.Schema({
  date: { type: String, required: true }, // format: YYYY-MM-DD
  booked: Number,
  occupied: Number,
  vacant: Number,
  outOfService: Number,
  checkIns: Number,
  checkOuts: Number,
  receptionRevenue: Number,
  restaurantRevenue: Number,
  chartData: [
    {
      name: String,
      value: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Reception", DashboardSchema);
