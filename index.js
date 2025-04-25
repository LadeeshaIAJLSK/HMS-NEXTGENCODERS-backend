const express = require("express");//
const mongoose = require("mongoose");//
const cors = require("cors");
const postRoutes = require("./routes/ownerdash");













const app = express();//
app.use(express.json());//
app.use(cors({ origin: "*" }));

app.use("/api/posts", postRoutes);
// Add this line to use the room routes
//i changes this



app.get("/", (req, res) => res.send("Server is running!"));




const port = 8000;
const DB_URL = "mongodb+srv://ladeekarunasinghe:Srilankaqazwsx456@cluster0.dtot1.mongodb.net/owner";




mongoose
  .connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));



