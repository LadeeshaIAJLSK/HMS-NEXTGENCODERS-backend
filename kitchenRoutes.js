const express = require('express');
const router = express.Router();
const KitchenOrder = require('../models/KitchenOrder');

// Create order
router.post('/', async (req, res) => {
  try {
    const order = await KitchenOrder.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  const orders = await KitchenOrder.find();
  res.json(orders);
});

// Update order status
router.put('/:id', async (req, res) => {
  const { status } = req.body;
  const order = await KitchenOrder.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(order);
});

module.exports = router;
