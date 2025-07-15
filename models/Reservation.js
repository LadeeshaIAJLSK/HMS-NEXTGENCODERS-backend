const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  // Booking Information
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  duration: { type: Number, required: true },
  adults: { type: Number, required: true, default: 1 },
  kids: { type: Number, default: 0 },
  
  // Guest Information
  firstName: { type: String, required: true },
  middleName: String,
  surname: String,
  mobile: { type: String, required: true },
  email: { type: String, match: /.+\@.+\..+/ },
  dob: Date,
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  address: { type: String, required: true },
  city: String,
  country: String,
  countryCode: String,
  
  // Identification
  idType: { 
    type: String, 
    required: true,
    enum: ['Passport', 'Driving License', 'National ID', 'Aadhar Card', 'Voter ID'] 
  },
  idNumber: { type: String, required: true },
  idFiles: [String],
  
  // Additional Guests
  otherPersons: [{
    name: String,
    gender: String,
    age: String,
    address: String,
    idType: String,
    idNo: String
  }],
  
  // Room Assignment
  selectedRooms: [{
    type: String,
    required: true,
    validate: [array => array.length > 0, 'At least one room must be selected']
  }],
  
  // Payment Information
  totalAmount: { 
    type: Number, 
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  paidAmount: { 
    type: Number, 
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI', 'Other']
  },
  paymentNotes: String,
  paymentIntentId: String,
  
  // Enhanced payment status with more descriptive values
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Fully Paid', 'Overpaid', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  
  // Cash handling fields for accurate transaction tracking
  cashReceived: {
    type: Number,
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  change: {
    type: Number,
    default: 0,
    set: v => Math.round(v * 100) / 100
  },
  
  receiptUrl: String,
  
  // Reservation Status
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'CheckedOut', 'NoShow'], 
    default: 'Pending' 
  },

  // Checkout Information
  checkoutDate: Date,
  checkoutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkoutNotes: String,

  // Audit Fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Soft Delete
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for amount due
reservationSchema.virtual('amountDue').get(function() {
  return this.totalAmount - this.paidAmount;
});

// Virtual for payment completion percentage
reservationSchema.virtual('paymentProgress').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Virtual for full guest name
reservationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.middleName || ''} ${this.surname || ''}`.trim();
});

// Pre-save hooks
reservationSchema.pre('save', function(next) {
  // Auto-calculate duration if dates are modified
  if (this.isModified('checkIn') || this.isModified('checkOut')) {
    const diff = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
    this.duration = diff > 0 ? diff : 1;
  }
  
  // Format mobile number with country code
  if (this.isModified('mobile') && this.countryCode) {
    this.mobile = `${this.countryCode} ${this.mobile.replace(/[^\d]/g, '')}`;
  }
  
  // Auto-update payment status based on amounts
  if (this.isModified('paidAmount') || this.isModified('totalAmount')) {
    this.paymentStatus = this.calculatePaymentStatus();
  }
  
  this.updatedAt = Date.now();
  next();
});

// Instance method to calculate payment status
reservationSchema.methods.calculatePaymentStatus = function() {
  const amountDue = this.totalAmount - this.paidAmount;
  
  if (this.paidAmount === 0) {
    return 'Pending';
  } else if (amountDue > 0) {
    return 'Partially Paid';
  } else if (amountDue === 0) {
    return 'Fully Paid';
  } else {
    return 'Overpaid';
  }
};

// Instance method to record payment
reservationSchema.methods.recordPayment = function(amount, method, notes, cashReceived = null) {
  const paymentAmount = parseFloat(amount);
  
  // Validate payment amount
  if (paymentAmount <= 0) {
    throw new Error('Payment amount must be greater than 0');
  }
  
  const newPaidAmount = this.paidAmount + paymentAmount;
  if (newPaidAmount > this.totalAmount) {
    throw new Error('Payment amount exceeds total amount due');
  }
  
  // Update payment fields
  this.paidAmount = newPaidAmount;
  this.paymentMethod = method;
  if (notes) this.paymentNotes = notes;
  
  // Handle cash transactions
  if (method === 'Cash' && cashReceived) {
    this.cashReceived = parseFloat(cashReceived);
    this.change = this.cashReceived - paymentAmount;
  }
  
  // Auto-update payment status
  this.paymentStatus = this.calculatePaymentStatus();
  
  return this;
};

// Instance method to checkout
reservationSchema.methods.checkout = function(userId = null, notes = null) {
  this.status = 'CheckedOut';
  this.checkoutDate = new Date();
  if (userId) this.checkoutBy = userId;
  if (notes) this.checkoutNotes = notes;
  
  return this;
};

// Update room statuses when reservation changes
reservationSchema.post('save', async function(doc) {
  try {
    // Import the Room model - adjust the path to match your project structure
    const Room = require('./posts'); // This should match your Room model file
    
    if (doc.status === 'Confirmed' || doc.status === 'CheckedIn') {
      await Room.updateMany(
        { RoomNo: { $in: doc.selectedRooms } },
        { $set: { RStatus: 'Occupied' } }
      );
    } else if (doc.status === 'CheckedOut' || doc.status === 'Cancelled') {
      await Room.updateMany(
        { RoomNo: { $in: doc.selectedRooms } },
        { $set: { RStatus: 'Vacant' } }
      );
    }
  } catch (error) {
    console.error('Error updating room statuses:', error);
  }
});

// Static method to calculate total amount
reservationSchema.statics.calculateTotal = async function(roomNos, duration) {
  try {
    // Import the Room model - adjust the path to match your project structure
    const Room = require('./posts'); // This should match your Room model file
    
    console.log('Calculating total for rooms:', roomNos, 'duration:', duration);
    
    const rooms = await Room.find({ RoomNo: { $in: roomNos } });
    
    if (rooms.length === 0) {
      console.log('No rooms found for calculation');
      return 0;
    }
    
    console.log('Found rooms:', rooms.map(r => ({ 
      roomNo: r.RoomNo, 
      price: r.RPrice || r.Price || 0 
    })));
    
    const totalRoomPrice = rooms.reduce((sum, room) => {
      // Handle both RPrice and Price fields
      const roomPrice = room.RPrice || room.Price || 0;
      console.log(`Room ${room.RoomNo}: ${roomPrice}`);
      return sum + roomPrice;
    }, 0);
    
    const totalAmount = totalRoomPrice * duration;
    console.log('Total room price per night:', totalRoomPrice);
    console.log('Total amount for', duration, 'nights:', totalAmount);
    
    return totalAmount;
  } catch (error) {
    console.error('Error calculating total amount:', error);
    return 0;
  }
};

// Static method to find reservations by payment status
reservationSchema.statics.findByPaymentStatus = function(status) {
  return this.find({ paymentStatus: status });
};

// Static method to find overdue checkouts
reservationSchema.statics.findOverdueCheckouts = function() {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return this.find({
    checkOut: { $lt: today },
    status: { $in: ['Confirmed', 'CheckedIn'] }
  });
};

// Static method to get payment statistics
reservationSchema.statics.getPaymentStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' }
        }
      }
    ]);
    
    return stats;
  } catch (error) {
    console.error('Error getting payment stats:', error);
    return [];
  }
};

// Index for better query performance
reservationSchema.index({ mobile: 1 });
reservationSchema.index({ checkIn: 1, checkOut: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ paymentStatus: 1 });
reservationSchema.index({ selectedRooms: 1 });
reservationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Reservation', reservationSchema);
