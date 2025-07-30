// ✅ DashboardController.js - Updated Today CheckIn/CheckOut logic
const DashboardBackup = require("../models/DashboardModel");
const Reservation = require("../models/Reservation");
const Room = require("../models/RoomsModel");
const Order = require("../models/Order");

exports.getLatestDashboardData = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Define start and end of day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      deleted: false,
      status: { $in: ['Confirmed', 'CheckedOut', 'Completed'] },
    });

    // ✅ Revenue
    const calculateDayRevenue = (reservations, date) => {
      return reservations.filter(res => {
        const checkIn = new Date(res.checkIn).toISOString().split('T')[0];
        return checkIn === date;
      }).reduce((total, res) => {
        const paid = res.reservationType === 'dayOut'
          ? res.paidAmount || 0
          : (res.paidAmount || 0) + (res.advancePayment || 0);
        return total + paid;
      }, 0);
    };

    const receptionRevenue = calculateDayRevenue(reservations, today);

    // ✅ Room status
    const rooms = await Room.find();
    const roomStatus = { booked: 0, vacant: 0, occupied: 0, outOfService: 0 };
    rooms.forEach(room => {
      const status = room.RStatus?.toLowerCase();
      if (status === 'booked') roomStatus.booked++;
      else if (status === 'vacant') roomStatus.vacant++;
      else if (status === 'occupied') roomStatus.occupied++;
      else if (status === 'out of service' || status === 'maintenance') roomStatus.outOfService++;
    });

    // ✅ Accurate Today Check-ins and Check-outs
    const todayCheckIns = reservations.filter(res => {
      const checkInDate = new Date(res.checkIn).toISOString().split('T')[0];
      return checkInDate === today;
    }).length;

    const todayCheckOuts = reservations.filter(res => {
      if (res.reservationType === 'dayOut') {
        const reservationDate = new Date(res.checkIn).toISOString().split('T')[0];
        return reservationDate === today;
      } else {
        const checkOutDate = res.checkOut ? new Date(res.checkOut).toISOString().split('T')[0] : null;
        return checkOutDate === today;
      }
    }).length;

    const restaurantOrders = await Order.find({
      status: "completed",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const todayRestaurantRevenue = restaurantOrders.reduce((sum, order) => sum + (order.total || 0), 0);

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
