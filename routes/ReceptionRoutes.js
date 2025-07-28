const express = require('express');
const router = express.Router();
const { getTodayReceptionStats } = require('../controllers/ReceptionstatController');

// GET /api/reception/stats/today
router.get('/stats/today', getTodayReceptionStats);

module.exports = router;
