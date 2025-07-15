const express = require('express');
const router = express.Router();
const HousekeepingTask = require('../models/HousekeepingTask');

// Create task
router.post('/', async (req, res) => {
  const task = await HousekeepingTask.create(req.body);
  res.status(201).json(task);
});

// Get all tasks
router.get('/', async (req, res) => {
  const tasks = await HousekeepingTask.find();
  res.json(tasks);
});

// Update status or readyTime
router.put('/:id', async (req, res) => {
  const task = await HousekeepingTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

module.exports = router;
