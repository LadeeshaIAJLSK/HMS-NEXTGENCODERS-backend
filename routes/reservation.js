const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Reservation = require("../models/Reservation");
const Room = require("../models/posts"); // Room model

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });


// ✅ Get available rooms
router.get("/available-rooms", async (req, res) => {
  try {
    const rooms = await Room.find({ RStatus: "Vacant" });
    res.json({ rooms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Search reservations
router.get("/search", async (req, res) => {
  try {
    const term = req.query.term;
    const results = await Reservation.find({
      $or: [
        { firstName: { $regex: term, $options: "i" } },
        { surname: { $regex: term, $options: "i" } },
        { mobile: { $regex: term } },
        { idNumber: { $regex: term } },
      ],
    }).sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get all reservations
router.get("/", async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get single reservation
router.get("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Submit reservation (Create)
router.post("/", upload.array("idFiles"), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    const otherPersons = JSON.parse(formData.otherPersons || "[]");
    const selectedRooms = JSON.parse(formData.selectedRooms || "[]");

    const reservation = new Reservation({
      ...formData,
      otherPersons,
      idFiles: files.map((file) => file.path),
      selectedRooms,
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
    });

    const saved = await reservation.save();

    // Book rooms
    await Room.updateMany(
      { RoomNo: { $in: selectedRooms } },
      { $set: { RStatus: "Booked" } }
    );

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(400).json({ message: err.message });
  }
});

// ✅ Update reservation
router.put("/:id", upload.array("idFiles"), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    const existingFiles = Array.isArray(formData.existingFiles)
      ? formData.existingFiles
      : [];

    const updatedRooms = JSON.parse(formData.selectedRooms || "[]");
    const otherPersons = typeof formData.otherPersons === "string"
      ? JSON.parse(formData.otherPersons)
      : formData.otherPersons;

    const updateData = {
      ...formData,
      otherPersons,
      idFiles: [...existingFiles, ...files.map(file => file.path)],
      selectedRooms: updatedRooms,
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
    };

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Optional: Update room status
    await Room.updateMany(
      { RoomNo: { $in: updatedRooms } },
      { $set: { RStatus: "Booked" } }
    );

    res.json({ message: "Reservation updated successfully", updatedReservation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete reservation
router.delete("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Optional: Mark rooms as Vacant (if you want to free them on delete)
    await Room.updateMany(
      { RoomNo: { $in: reservation.selectedRooms } },
      { $set: { RStatus: "Vacant" } }
    );

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
