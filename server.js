import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import roomsRoutes from './routes/RoomsRoutes.js';
import receptionRoutes from './routes/ReceptionRoutes.js';
import settingsRoutes from './routes/SettingsRoutes.js';
import salesRoutes from './routes/SalesRoutes.js';
import transactionRoutes from './routes/TransactionRoutes.js';
import stockRoutes from './routes/StockRoutes.js';
import checkoutRoutes from './routes/CheckoutRoutes.js';


import roomRoutes from "./routes/rooms.js";
import reservationRoutes from "./routes/reservation.js";
import guestRoutes from "./routes/guestRoutes.js";
import packageRoutes from "./routes/packages.js";
import dailyDataRoutes from './routes/dailyData.js';



import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";






dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use('/api/rooms', roomsRoutes);
app.use('/api/reception', receptionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/checkouts', checkoutRoutes);
app.use("/uploads", express.static("uploads"));


app.use("/api/reservations", reservationRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/daily-data', dailyDataRoutes);



app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
