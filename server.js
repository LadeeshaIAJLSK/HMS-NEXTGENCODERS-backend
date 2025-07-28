const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const roomsRoutes = require('./routes/RoomsRoutes');
const dashboardRoutes = require('./routes/DashboardRoutes');
const reservationRoutes = require('./routes/reservation');
const orderRoutes = require('./routes/orderRoutes');
const settingsRoutes = require('./routes/SettingsRoutes');
const salesRoutes = require('./routes/SalesRoutes');
const transactionRoutes = require('./routes/TransactionRoutes');
const stockRoutes = require('./routes/StockRoutes');
const checkoutRoutes = require('./routes/CheckoutRoutes');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Register routes
app.use('/api/rooms', roomsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/checkouts', checkoutRoutes);
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
