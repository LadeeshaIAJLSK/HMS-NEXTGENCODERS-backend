import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Reservation from "../models/Reservation.js";
import Room from "../models/RoomsModel.js"; // Room model

const router = express.Router();

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

// ✅ Get single reservation with room details
router.get("/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Fetch room details for the reserved rooms
    let roomDetails = [];
    if (reservation.selectedRooms && reservation.selectedRooms.length > 0) {
      roomDetails = await Room.find({ 
        RoomNo: { $in: reservation.selectedRooms } 
      });
    }

    res.json({
      ...reservation.toObject(),
      roomDetails: roomDetails
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Submit reservation (Create)
router.post("/", upload.array("idFiles"), async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;

    console.log("Form data received:", formData);

    const otherPersons = JSON.parse(formData.otherPersons || "[]");
    const selectedRooms = JSON.parse(formData.selectedRooms || "[]");

    // Validate required fields
    if (!formData.checkIn || !formData.checkOut || !formData.firstName || !formData.mobile) {
      return res.status(400).json({ 
        message: "Missing required fields: checkIn, checkOut, firstName, mobile" 
      });
    }

    if (selectedRooms.length === 0) {
      return res.status(400).json({ 
        message: "At least one room must be selected" 
      });
    }

    // Calculate duration
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (duration <= 0) {
      return res.status(400).json({ 
        message: "Check-out date must be after check-in date" 
      });
    }

    // Calculate total amount using the static method from the model
    const totalAmount = await Reservation.calculateTotal(selectedRooms, duration);

    console.log("Calculated total amount:", totalAmount);

    // Prepare reservation data
    const reservationData = {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      duration: duration,
      adults: parseInt(formData.adults) || 1,
      kids: parseInt(formData.kids) || 0,
      firstName: formData.firstName,
      middleName: formData.middleName || "",
      surname: formData.surname || "",
      mobile: formData.mobile,
      email: formData.email || "",
      dob: formData.dob ? new Date(formData.dob) : null,
      address: formData.address,
      city: formData.city || "",
      gender: formData.gender || "",
      idType: formData.idType,
      idNumber: formData.idNumber,
      country: formData.country || "",
      countryCode: formData.countryCode || "",
      otherPersons: otherPersons,
      selectedRooms: selectedRooms,
      idFiles: files.map((file) => file.path),
      
      // Payment fields
      totalAmount: totalAmount,
      paidAmount: parseFloat(formData.advancePayment || formData.paidAmount || 0),
      paymentMethod: formData.paymentMethod || "",
      paymentNotes: formData.paymentNotes || "",
      paymentStatus: 'Pending',
      
      // Set status to Confirmed
      status: "Confirmed"
    };

    console.log("Creating reservation with data:", reservationData);

    const reservation = new Reservation(reservationData);
    const saved = await reservation.save();

    console.log("Reservation saved:", saved._id);

    // Book rooms - Update status to 'Occupied'
    await Room.updateMany(
      { RoomNo: { $in: selectedRooms } },
      { $set: { RStatus: "Occupied" } }
    );

    console.log("Rooms updated to Occupied:", selectedRooms);

    // Return success response with amount details
    res.status(201).json({
      message: "Reservation created successfully",
      reservation: {
        _id: saved._id,
        totalAmount: saved.totalAmount,
        paidAmount: saved.paidAmount,
        amountDue: saved.totalAmount - saved.paidAmount,
        status: saved.status,
        selectedRooms: saved.selectedRooms,
        checkIn: saved.checkIn,
        checkOut: saved.checkOut,
        duration: saved.duration
      }
    });

  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(400).json({ 
      message: "Error creating reservation", 
      error: err.message 
    });
  }
});

// ✅ Update reservation
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

    // Calculate duration if dates are provided
    let duration = parseInt(formData.duration);
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn);
      const checkOutDate = new Date(formData.checkOut);
      duration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    }

    // Calculate total amount if rooms or duration changed
    let totalAmount = formData.totalAmount;
    const selectedRooms = formData.selectedRooms || [];
    
    if (selectedRooms.length > 0 && duration > 0) {
      totalAmount = await Reservation.calculateTotal(selectedRooms, duration);
    }

    // Prepare update data with proper validation
    const updateData = {
      firstName: formData.firstName?.trim(),
      middleName: formData.middleName?.trim() || "",
      surname: formData.surname?.trim() || "",
      mobile: formData.mobile?.trim(),
      email: formData.email?.trim() || "",
      dob: formData.dob || "",
      address: formData.address?.trim() || "Not provided",
      city: formData.city?.trim() || "",
      idType: formData.idType || "Passport",
      idNumber: formData.idNumber?.trim() || "",
      checkIn: new Date(formData.checkIn),
      checkOut: new Date(formData.checkOut),
      duration: duration,
      adults: parseInt(formData.adults) || 1,
      kids: parseInt(formData.kids) || 0,
      otherPersons: formData.otherPersons || [],
      selectedRooms: selectedRooms,
      country: formData.country || "",
      countryCode: formData.countryCode || "",
      totalAmount: totalAmount || 0,
      paidAmount: parseFloat(formData.paidAmount || 0)
    };

    // Handle gender enum - only set if valid
    if (formData.gender && ['Male', 'Female', 'Other'].includes(formData.gender)) {
      updateData.gender = formData.gender;
    }

    // Handle payment method enum - only set if valid and not empty
    const validPaymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other'];
    if (formData.paymentMethod && validPaymentMethods.includes(formData.paymentMethod)) {
      updateData.paymentMethod = formData.paymentMethod;
    }

    // Handle payment notes - only set if not empty
    if (formData.paymentNotes && formData.paymentNotes.trim() !== "") {
      updateData.paymentNotes = formData.paymentNotes.trim();
    }

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
      { $set: updateData },
      { 
        new: true,
        runValidators: true
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

      // Mark new rooms as occupied
      if (newRooms.length > 0) {
        await Room.updateMany(
          { RoomNo: { $in: newRooms } },
          { $set: { RStatus: "Occupied" } }
        );
        console.log("Occupied rooms:", newRooms);
      }
    }

    res.json({ 
      success: true,
      message: "Reservation updated successfully", 
      reservation: {
        _id: updatedReservation._id,
        totalAmount: updatedReservation.totalAmount,
        paidAmount: updatedReservation.paidAmount,
        amountDue: updatedReservation.totalAmount - updatedReservation.paidAmount,
        status: updatedReservation.status
      }
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

// ✅ Checkout endpoint with payment status tracking
router.put("/:id/checkout", async (req, res) => {
  try {
    const { paymentStatus, paidAmount, totalAmount } = req.body;
    
    const updateData = { 
      status: "CheckedOut",
      checkoutDate: new Date(),
      paymentStatus: paymentStatus || 'Pending'
    };

    // Update payment fields if provided
    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount;
    }
    if (totalAmount !== undefined) {
      updateData.totalAmount = totalAmount;
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Mark rooms as Vacant when checking out
    if (reservation.selectedRooms && reservation.selectedRooms.length > 0) {
      await Room.updateMany(
        { RoomNo: { $in: reservation.selectedRooms } },
        { $set: { RStatus: "Vacant" } }
      );
    }

    res.json({ 
      message: "Guest checked out successfully", 
      reservation,
      paymentStatus: reservation.paymentStatus,
      amountDue: reservation.totalAmount - reservation.paidAmount
    });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Get payments for a reservation
router.get("/:id/payments", async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Return payment information from the reservation
    const paymentInfo = {
      totalAmount: reservation.totalAmount,
      paidAmount: reservation.paidAmount,
      amountDue: reservation.totalAmount - reservation.paidAmount,
      paymentMethod: reservation.paymentMethod,
      paymentNotes: reservation.paymentNotes,
      paymentStatus: reservation.paymentStatus
    };

    res.json(paymentInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Add payment to reservation
router.post("/:id/payments", async (req, res) => {
  try {
    const { amount, paymentMethod, notes, cashReceived, change } = req.body;
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const paymentAmount = parseFloat(amount);
    const newPaidAmount = reservation.paidAmount + paymentAmount;
    
    // Validate payment amount
    if (paymentAmount <= 0) {
      return res.status(400).json({ 
        message: "Payment amount must be greater than 0" 
      });
    }

    if (newPaidAmount > reservation.totalAmount) {
      return res.status(400).json({ 
        message: "Payment amount exceeds total amount due" 
      });
    }

    // Prepare update data
    const updateData = {
      paidAmount: newPaidAmount,
      paymentStatus: newPaidAmount >= reservation.totalAmount ? 'Captured' : 'Pending'
    };

    // Update payment method if provided
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
    }

    // Update payment notes if provided
    if (notes) {
      updateData.paymentNotes = notes;
    }

    // Store cash handling details if provided
    if (cashReceived !== undefined) {
      updateData.cashReceived = parseFloat(cashReceived);
    }
    if (change !== undefined) {
      updateData.change = parseFloat(change);
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: "Payment added successfully",
      payment: {
        amount: paymentAmount,
        method: paymentMethod,
        notes: notes,
        cashReceived: cashReceived,
        change: change,
        date: new Date()
      },
      reservation: {
        totalAmount: updatedReservation.totalAmount,
        paidAmount: updatedReservation.paidAmount,
        amountDue: updatedReservation.totalAmount - updatedReservation.paidAmount,
        paymentStatus: updatedReservation.paymentStatus
      }
    });

  } catch (err) {
    console.error("Error adding payment:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;