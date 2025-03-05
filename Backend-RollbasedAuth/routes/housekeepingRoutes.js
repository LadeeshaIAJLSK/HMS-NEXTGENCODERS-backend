const express = require("express");
const Housekeeping = require("../models/Housekeeping");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a Housekeeping Request (Customer & Reception)
router.post("/", authMiddleware(["customer", "reception"]), async (req, res) => {
  try {
    const request = await Housekeeping.create(req.body);
    res.status(201).json({ message: "Housekeeping Request Created", request });
  } catch (error) {
    res.status(400).json({ error: "Failed to create request" });
  }
});

// Get All Housekeeping Requests (Owner, Reception & Housekeeping Staff)
router.get("/", authMiddleware(["owner", "reception", "housekeeping"]), async (req, res) => {
  const requests = await Housekeeping.find();
  res.json(requests);
});

// Update Housekeeping Status (Housekeeping Staff only)
router.put("/:id", authMiddleware(["housekeeping"]), async (req, res) => {
  try {
    const request = await Housekeeping.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Request Updated", request });
  } catch (error) {
    res.status(400).json({ error: "Failed to update request" });
  }
});

// Delete Housekeeping Request (Reception only)
router.delete("/:id", authMiddleware(["reception"]), async (req, res) => {
  try {
    await Housekeeping.findByIdAndDelete(req.params.id);
    res.json({ message: "Request Deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete request" });
  }
});

module.exports = router;
