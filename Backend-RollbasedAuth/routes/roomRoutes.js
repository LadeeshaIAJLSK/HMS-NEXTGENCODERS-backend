const express = require("express");
const Room = require("../models/Room");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a Room (Owner only)
router.post("/", authMiddleware(["owner"]), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ message: "Room Created", room });
  } catch (error) {
    res.status(400).json({ error: "Failed to create room" });
  }
});

// Get All Rooms
router.get("/", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

// Update Room (Owner only)
router.put("/:id", authMiddleware(["owner"]), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Room Updated", room });
  } catch (error) {
    res.status(400).json({ error: "Failed to update room" });
  }
});

// Delete Room (Owner only)
router.delete("/:id", authMiddleware(["owner"]), async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room Deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete room" });
  }
});

module.exports = router;
