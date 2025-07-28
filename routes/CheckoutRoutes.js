const express = require("express");
const router = express.Router();
const {
  getAllCheckouts,
  getCheckoutById,
} = require("../controllers/CheckoutController");

// Route: GET all checkouts
router.get("/", getAllCheckouts);

// Route: GET single checkout guest by ID
router.get("/:id", getCheckoutById);

module.exports = router;
