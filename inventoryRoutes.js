const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/InventoryItem');

// Create item
router.post('/', async (req, res) => {
  const item = await InventoryItem.create(req.body);
  res.status(201).json(item);
});

// Get all items
router.get('/', async (req, res) => {
  const items = await InventoryItem.find();
  res.json(items);
});

// Update item
router.put('/:id', async (req, res) => {
  const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

// Delete item
router.delete('/:id', async (req, res) => {
  await InventoryItem.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item deleted' });
});

module.exports = router;
