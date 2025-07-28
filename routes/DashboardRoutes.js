const express = require("express");
const router = express.Router();
const {
  getLatestDashboardData,
  storeDashboardBackup,
} = require("../controllers/DashboardController");

router.get("/latest", getLatestDashboardData);
router.post("/backup", storeDashboardBackup);

module.exports = router;
