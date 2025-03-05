const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: Number, required: true, unique: true },
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, default: true }
});

module.exports = mongoose.model("Room", RoomSchema);
