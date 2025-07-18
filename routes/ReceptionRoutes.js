const express = require("express");
const router = express.Router();
const {
  getLatestReception,
  addReception
} = require("./controllers/ReceptionController");

router.get("/latest", getLatestReception);
router.post("/", addReception);

module.exports = router;
