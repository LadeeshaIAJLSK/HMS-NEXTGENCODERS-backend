require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("./config/db");


const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const housekeepingRoutes = require("./routes/housekeepingRoutes");


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/housekeeping", housekeepingRoutes);


app.get("/", (req, res) => {
  res.send("Hotel Management System API is running...");
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});


app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
