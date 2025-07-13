const express = require('express');
const router = express.Router();
const salesController = require('../controllers/SalesController');

// Routes
router.get('/', salesController.getSalesByPeriod);
router.post('/', salesController.insertSalesData);

module.exports = router;