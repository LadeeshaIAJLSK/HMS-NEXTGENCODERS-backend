const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const roomsRoutes = require('./routes/RoomsRoutes'); 
app.use('/api/rooms', roomsRoutes); // will now correctly resolve to /api/rooms
  
const receptionRoutes = require('./routes/ReceptionRoutes');
app.use('/api/reception', receptionRoutes);

const settingsRoutes = require('./routes/SettingsRoutes');
app.use('/api/settings', settingsRoutes);
app.use("/uploads", express.static("uploads")); // Serve uploaded logos

const salesRoutes = require('./routes/SalesRoutes');
app.use('/api/sales', salesRoutes);

const transactionRoutes = require("./routes/TransactionRoutes");
app.use("/api/transactions", transactionRoutes);

const stockRoutes = require("./routes/StockRoutes");
app.use("/api/stocks", stockRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
