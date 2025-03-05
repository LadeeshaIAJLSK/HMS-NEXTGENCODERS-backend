const express = require("express");
const KitchenOrder = require("../models/KitchenOrder");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a Kitchen Order (Customer & Reception)
router.post("/", authMiddleware(["customer", "reception"]), async (req, res) => {
  try {
    const order = await KitchenOrder.create(req.body);
    res.status(201).json({ message: "Kitchen Order Placed", order });
  } catch (error) {
    res.status(400).json({ error: "Failed to place order" });
  }
});

// Get All Kitchen Orders (Owner, Reception & Kitchen Staff)
router.get("/", authMiddleware(["owner", "reception", "kitchen"]), async (req, res) => {
  const orders = await KitchenOrder.find();
  res.json(orders);
});

// Update Kitchen Order Status (Kitchen Staff only)
router.put("/:id", authMiddleware(["kitchen"]), async (req, res) => {
  try {
    const order = await KitchenOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Order Updated", order });
  } catch (error) {
    res.status(400).json({ error: "Failed to update order" });
  }
});

// Delete Order (Reception only)
router.delete("/:id", authMiddleware(["reception"]), async (req, res) => {
  try {
    await KitchenOrder.findByIdAndDelete(req.params.id);
    res.json({ message: "Order Deleted" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
