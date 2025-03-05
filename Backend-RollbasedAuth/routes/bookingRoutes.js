const express = require("express");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a Booking (Reception & Customer)
router.post("/", authMiddleware(["reception", "customer"]), async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ message: "Booking Created", booking });
  } catch (error) {
    res.status(400).json({ error: "Failed to create booking" });
  }
});

// Get All Bookings (Owner & Reception)
router.get("/", authMiddleware(["owner", "reception"]), async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

// Update Booking (Reception only)
router.put("/:id", authMiddleware(["reception"]), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Booking Updated", booking });
  } catch (error) {
    res.status(400).json({ error: "Failed to update booking" });
  }
});

// Delete Booking (Reception only)
router.delete("/:id", authMiddleware(["reception"]), async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking Deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete booking" });
  }
});

module.exports = router;
