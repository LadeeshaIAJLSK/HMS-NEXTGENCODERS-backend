const mongoose = require("mongoose");

const ReceptionSchema = new mongoose.Schema({
  booked: Number,
  occupied: Number,
  vacant: Number,
  outOfService: Number,
  todayCheckIns: Number,
  todayCheckOuts: Number
}, { timestamps: true });

module.exports = mongoose.model("Reception", ReceptionSchema);
