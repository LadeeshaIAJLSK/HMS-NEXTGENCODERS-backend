const DashboardBackup = require("../models/DashboardModel");
const Reservation = require("../models/Reservation");
const Room = require("../models/RoomsModel");
const Order = require("../models/Order"); // <-- Include this

exports.getLatestDashboardData = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const rooms = await Room.find();

    // Room status count
    const roomStatus = {
      booked: 0,
      vacant: 0,
      occupied: 0,
      outOfService: 0,
    };

    rooms.forEach(room => {
      const status = room.RStatus?.toLowerCase();
      if (status === "booked") roomStatus.booked++;
      else if (status === "vacant") roomStatus.vacant++;
      else if (status === "occupied") roomStatus.occupied++;
      else if (status === "out of service" || status === "maintenance") roomStatus.outOfService++;
    });

    // Reservations
    const reservationsToday = await Reservation.find({
      $or: [
        { checkIn: { $gte: startOfDay, $lte: endOfDay } },
        { checkOut: { $gte: startOfDay, $lte: endOfDay } }
      ],
      status: { $in: ['Confirmed', 'CheckedIn', 'CheckedOut', 'Completed'] }
    });

    const todayCheckIns = reservationsToday.filter(r =>
      r.checkIn && r.checkIn >= startOfDay && r.checkIn <= endOfDay
    ).length;

    const todayCheckOuts = reservationsToday.filter(r =>
      r.checkOut && r.checkOut >= startOfDay && r.checkOut <= endOfDay
    ).length;

    const todayReceptionRevenue = reservationsToday.reduce((sum, r) => sum + (r.paidAmount || 0), 0);

    // 🧾 Fetch restaurant revenue
    const restaurantOrders = await Order.find({
      status: "completed",
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const todayRestaurantRevenue = restaurantOrders.reduce((sum, order) => sum + order.total, 0);

    res.status(200).json({
      todayCheckIns,
      todayCheckOuts,
      receptionRevenue: Math.round(todayReceptionRevenue * 100) / 100,
      restaurantRevenue: Math.round(todayRestaurantRevenue * 100) / 100,
      ...roomStatus
    });
  } catch (err) {
    console.error("🔥 Error in getLatestDashboardData:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.storeDashboardBackup = async (req, res) => {
  try {
    const {
      date,
      todayCheckIns,
      todayCheckOuts,
      booked,
      occupied,
      vacant,
      outOfService,
      receptionRevenue,
      restaurantRevenue
    } = req.body;

    const newBackup = new DashboardBackup({
      date,
      checkIns: todayCheckIns,
      checkOuts: todayCheckOuts,
      booked,
      occupied,
      vacant,
      outOfService,
      receptionRevenue,
      restaurantRevenue
    });

    await newBackup.save();

    res.status(200).json({ message: "Backup stored successfully" });
  } catch (err) {
    console.error("Backup store error:", err);
    res.status(500).json({ message: "Failed to store backup" });
  }
};

