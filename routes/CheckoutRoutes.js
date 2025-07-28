// routes/CheckoutRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllCheckedOutGuests,
  getCheckedOutGuestById,
} = require("../controllers/CheckoutController");

// Route: GET /api/checkout
router.get("/", getAllCheckedOutGuests);

// Route: GET /api/checkout/:id
router.get("/:id", getCheckedOutGuestById);

module.exports = router;
