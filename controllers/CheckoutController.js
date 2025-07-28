const Reservation = require("../models/Reservation");

// GET all checked out guests
const getAllCheckouts = async (req, res) => {
  try {
    const checkouts = await Reservation.find({ status: "CheckedOut" });
    res.status(200).json(checkouts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch checkouts" });
  }
};

// GET single guest by ID
const getCheckoutById = async (req, res) => {
  try {
    const id = req.params.id;
    const guest = await Reservation.findById(id);
    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }
    res.status(200).json(guest);
  } catch (err) {
    console.error("Error fetching guest details:", err);
    res.status(500).json({ error: "Failed to fetch guest details" });
  }
};


module.exports = { getAllCheckouts, getCheckoutById };
