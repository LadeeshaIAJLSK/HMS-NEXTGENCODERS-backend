const DashboardBackup = require("../models/DashboardModel");
const Reservation = require("../models/Reservation");
const Room = require("../models/RoomsModel");
const Order = require("../models/Order");

// ✅ Updated getLatestDashboardData to match Reception Revenue Calculation
exports.getLatestDashboardData = async (req, res) => {
  try {
    const today = new Date();
    const targetDate = today.toISOString().split('T')[0];

    const reservations = await Reservation.find({
      deleted: false,
      status: { $in: ['Confirmed', 'CheckedOut', 'Completed'] },
    });

    // ✅ Match with reception calculation: checkIn === today (as string) + paidAmount/advancePayment
    const calculateDayRevenue = (reservations, date) => {
      return reservations
        .filter(reservation => {
          const checkInDate = new Date(reservation.checkIn).toISOString().split('T')[0];
          return checkInDate === date;
        })
        .reduce((total, reservation) => {
          const amount = reservation.reservationType === 'dayOut'
            ? reservation.paidAmount || 0
            : (reservation.paidAmount || 0) + (reservation.advancePayment || 0);
          return total + amount;
        }, 0);
    };

    const receptionRevenue = calculateDayRevenue(reservations, targetDate);

    // Room status as before
    const rooms = await Room.find();
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

    // Today CheckIns and CheckOuts (same logic)
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const reservationsToday = reservations.filter(r =>
      r.updatedAt >= startOfDay && r.updatedAt <= endOfDay
    );

    const todayCheckIns = reservationsToday.filter(r =>
      r.checkIn && r.checkIn >= startOfDay && r.checkIn <= endOfDay
    ).length;

    const todayCheckOuts = reservationsToday.filter(r =>
      r.checkoutDate && r.checkoutDate >= startOfDay && r.checkoutDate <= endOfDay
    ).length;

    // Restaurant Revenue
    const restaurantOrders = await Order.find({
      status: "completed",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const todayRestaurantRevenue = restaurantOrders.reduce((sum, order) => {
      return sum + (order.total || 0);
    }, 0);

    // ✅ FINAL RESPONSE
    res.status(200).json({
      todayCheckIns,
      todayCheckOuts,
      receptionRevenue: Math.round(receptionRevenue * 100) / 100,
      restaurantRevenue: Math.round(todayRestaurantRevenue * 100) / 100,
      ...roomStatus
    });
  } catch (err) {
    console.error("🔥 Error in getLatestDashboardData:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


// 🔄 Backup Route
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
