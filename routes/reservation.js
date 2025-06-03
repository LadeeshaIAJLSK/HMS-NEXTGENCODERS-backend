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

// ✅ FIXED Update reservation - Handle JSON data properly
router.put("/:id", async (req, res) => {
  try {
    console.log("Update request received for ID:", req.params.id);
    console.log("Request body:", req.body);

    const reservationId = req.params.id;
    const formData = req.body;

    // Validate reservation exists
    const existingReservation = await Reservation.findById(reservationId);
    if (!existingReservation) {
      return res.status(404).json({ 
        success: false,
        message: "Reservation not found" 
      });
    }

    // Prepare update data with proper validation
    const updateData = {
      firstName: formData.firstName?.trim(),
      middleName: formData.middleName?.trim() || "",
      surname: formData.surname?.trim() || "",
      mobile: formData.mobile?.trim(),
      email: formData.email?.trim() || "",
      dob: formData.dob || "",
      address: formData.address?.trim() || "",
      city: formData.city?.trim() || "",
      gender: formData.gender || "",
      idType: formData.idType || "",
      idNumber: formData.idNumber?.trim() || "",
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      duration: parseInt(formData.duration) || 1,
      adults: parseInt(formData.adults) || 1,
      kids: parseInt(formData.kids) || 0,
      otherPersons: formData.otherPersons || [],
      selectedRooms: formData.selectedRooms || [],
      country: formData.country || "",
      countryCode: formData.countryCode || ""
    };

    // Validate required fields
    if (!updateData.firstName || !updateData.mobile || !updateData.checkIn || !updateData.checkOut) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields: firstName, mobile, checkIn, checkOut" 
      });
    }

    console.log("Prepared update data:", updateData);

    // Get original rooms to update their status later
    const originalRooms = existingReservation.selectedRooms || [];
    const newRooms = updateData.selectedRooms || [];

    // Update the reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      updateData,
      { 
        new: true, // Return updated document
        runValidators: true // Run mongoose validations
      }
    );

    if (!updatedReservation) {
      return res.status(404).json({ 
        success: false,
        message: "Failed to update reservation" 
      });
    }

    console.log("Successfully updated reservation:", updatedReservation._id);

    // Update room statuses if rooms changed
    if (JSON.stringify(originalRooms.sort()) !== JSON.stringify(newRooms.sort())) {
      console.log("Updating room statuses...");
      
      // Mark old rooms as vacant (if they're not in the new selection)
      const roomsToVacate = originalRooms.filter(room => !newRooms.includes(room));
      if (roomsToVacate.length > 0) {
        await Room.updateMany(
          { RoomNo: { $in: roomsToVacate } },
          { $set: { RStatus: "Vacant" } }
        );
        console.log("Vacated rooms:", roomsToVacate);
      }

      // Mark new rooms as booked
      if (newRooms.length > 0) {
        await Room.updateMany(
          { RoomNo: { $in: newRooms } },
          { $set: { RStatus: "Booked" } }
        );
        console.log("Booked rooms:", newRooms);
      }
    }

    res.json({ 
      success: true,
      message: "Reservation updated successfully", 
      updatedReservation 
    });

  } catch (err) {
    console.error("Error updating reservation:", err);
    
    // More specific error handling
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid reservation ID format" 
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: err.message 
    });
  }
});

// ✅ Delete reservation
router.delete("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Mark rooms as Vacant when reservation is deleted
    if (reservation.selectedRooms && reservation.selectedRooms.length > 0) {
      await Room.updateMany(
        { RoomNo: { $in: reservation.selectedRooms } },
        { $set: { RStatus: "Vacant" } }
      );
    }

    res.json({ message: "Reservation deleted successfully" });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Checkout endpoint
router.put("/:id/checkout", async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { 
        status: "checked_out",
        checkoutDate: new Date()
      },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({ message: "Guest checked out successfully", reservation });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get payments for a reservation
router.get("/:id/payments", async (req, res) => {
  try {
    // This assumes you have a Payment model or payments are stored in the reservation
    // Adjust according to your payment storage structure
    const payments = []; // Replace with actual payment fetching logic
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;