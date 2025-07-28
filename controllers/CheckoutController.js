// controllers/CheckoutController.js

const Reservation = require("../models/CheckoutModel");

// GET all checked-out guests
const getAllCheckedOutGuests = async (req, res) => {
  try {
    const checkedOutGuests = await Reservation.find({ status: "CheckedOut" }).sort({ checkoutDate: -1 });
    res.status(200).json(checkedOutGuests);
  } catch (error) {
    console.error("Error fetching checked out guests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET a single guest by ID
const getCheckedOutGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    const guest = await Reservation.findById(id);

    if (!guest || guest.status !== "CheckedOut") {
      return res.status(404).json({ message: "Guest not found or not checked out" });
    }

    res.status(200).json(guest);
  } catch (error) {
    console.error("Error fetching guest by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllCheckedOutGuests,
  getCheckedOutGuestById,
};
