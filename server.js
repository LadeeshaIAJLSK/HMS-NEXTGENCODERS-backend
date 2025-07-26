const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/kitchen', require('./routes/kitchenRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/housekeeping', require('./routes/housekeepingRoutes'));

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

