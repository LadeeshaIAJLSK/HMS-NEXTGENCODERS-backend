const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const roomsRoutes = require("./routes/posts");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use("/api", roomsRoutes);
app.get("/", (req, res) => res.send("Server is running!"));

const port = 8000;
const DB_URL = "mongodb+srv://TCC:Htcc%40123@cluster0.r4hz0.mongodb.net/owner?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));