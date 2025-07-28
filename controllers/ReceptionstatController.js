const Reservation = require('../models/Reservation');

exports.getTodayReceptionStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find today's check-ins
    const checkIns = await Reservation.find({
      checkIn: { $gte: today, $lt: tomorrow },
      deleted: false,
    });

    // Find today's check-outs
    const checkOuts = await Reservation.find({
      checkoutDate: { $gte: today, $lt: tomorrow },
      deleted: false,
    });

    // Calculate total revenue (for confirmed/completed/checked-out)
    const revenue = await Reservation.aggregate([
      {
        $match: {
          status: { $in: ['Confirmed', 'CheckedOut', 'Completed'] },
          deleted: false,
          updatedAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' }
        }
      }
    ]);

    res.status(200).json({
      date: today.toISOString().split('T')[0],
      checkInsCount: checkIns.length,
      checkOutsCount: checkOuts.length,
      totalRevenue: revenue[0]?.totalRevenue || 0
    });
  } catch (error) {
    console.error('Error in getTodayReceptionStats:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
