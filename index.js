const express = require("express");//
const mongoose = require("mongoose");//
const cors = require("cors");
require('dotenv').config();

const postRoutes = require("./routes/posts");
const roomRoutes = require("./routes/rooms");
const reservationRoutes = require("./routes/reservation");
const guestRoutes = require("./routes/guestRoutes");
const packageRoutes = require("./routes/packages"); 
const dailyDataRoutes = require('./routes/dailyData');
const paymentRoutes = require('./routes/process-payment'); // Add this line














const app = express();//
app.use(express.json());//
app.use(cors({ origin: "*" }));

app.use("/api/posts", postRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reservations", reservationRoutes);// Add this line to use the room routes
app.use('/api/guests', guestRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/daily-data', dailyDataRoutes);
app.use('/api/process-payment', paymentRoutes); // Add this line to use the payment routes
//i changes this



app.get("/", (req, res) => res.send("Server is running!"));




const port = 8000;
const DB_URL = process.env.DB_URL;




mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));






