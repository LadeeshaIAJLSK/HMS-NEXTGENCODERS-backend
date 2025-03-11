const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const categoryRoutes = require("./routes/categoryRoutes"); // Import category routes
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Use category routes
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
