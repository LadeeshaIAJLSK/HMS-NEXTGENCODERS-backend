const mongoose = require("mongoose");

const HousekeepingSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomNumber: { type: String, required: true },
    requestType: {
      type: String,
      enum: ["Cleaning", "Laundry", "Towel Change", "Other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    requestedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Housekeeping", HousekeepingSchema);
