const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();

// Import all route modules
const postRoutes = require("./routes/posts");
const roomRoutes = require("./routes/rooms");
const reservationRoutes = require("./routes/reservation");
const guestRoutes = require("./routes/guestRoutes");
const packageRoutes = require("./routes/packages");
const dailyDataRoutes = require('./routes/dailyData');
const paymentRoutes = require('./routes/process-payment');
const orderRoutes = require('./routes/orderRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const cartRouter = require('./routes/cartRoutes');

const app = express();
const port = 8000;

// Database connection
const DB_URL = process.env.MONGO_URI;

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173', '*'],
  credentials: true
}));

// Root endpoint
app.get("/", (req, res) => res.send("Server is running!"));

// API Routes
app.use("/api/posts", postRoutes);
app.use('/orders', orderRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reservations", reservationRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/daily-data', dailyDataRoutes);
app.use('/api/process-payment', paymentRoutes);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));