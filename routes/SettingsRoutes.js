const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getSettings, updateSettings } = require("../controllers/SettingsController");

// Multer setup
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "site-logo" + ext); // Save as site-logo.png, etc.
  },
});
const upload = multer({ storage });

// GET and PUT endpoints
router.get("/", getSettings);
router.put("/", upload.single("logo"), updateSettings);

module.exports = router;
