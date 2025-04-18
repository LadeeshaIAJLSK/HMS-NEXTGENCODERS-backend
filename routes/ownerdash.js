const express = require("express");
const router = express.Router();
const Room = require("../models/posts");

router.post("/posts/save", async (req, res) => {
    try {
        const existingRoom = await Room.findOne({ RoomNo: req.body.RoomNo });
        if (existingRoom) {
            return res.status(400).json({ success: false, message: "Room-No must be unique!" });
        }
        
        const newRoom = new Room(req.body);
        await newRoom.save();
        res.status(201).json({ success: true, message: "Room added successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json({ success: true, rooms });
  } catch (err) {
    console.error("GET /rooms error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/rooms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    return res.status(200).json({ success: true, room });
  } catch (err) {
    console.error(`Error fetching room with ID ${id}:`, err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/rooms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedRoom = await Room.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedRoom) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    return res.status(200).json({ success: true, message: "Room updated successfully", room: updatedRoom });
  } catch (err) {
    console.error(`Error updating room with ID ${id}:`, err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.delete("/rooms/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRoom = await Room.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    return res.status(200).json({ success: true, message: "Room deleted successfully" });
  } catch (err) {
    console.error(`Error deleting room with ID ${id}:`, err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;