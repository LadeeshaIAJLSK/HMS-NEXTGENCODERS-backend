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
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Authorized', 'Captured', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  receiptUrl: String,
  
  // Reservation Status
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled', 'CheckedIn', 'CheckedOut', 'NoShow'], 
    default: 'Pending' 
  },

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

// Pre-save hooks
reservationSchema.pre('save', function(next) {
  if (this.isModified('checkIn') || this.isModified('checkOut')) {
    const diff = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
    this.duration = diff > 0 ? diff : 1;
  }
  
  if (this.isModified('mobile') && this.countryCode) {
    this.mobile = `${this.countryCode} ${this.mobile.replace(/[^\d]/g, '')}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Update room statuses when reservation changes
reservationSchema.post('save', async function(doc) {
  const Room = mongoose.model('Room');
  
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
});

// Static method to calculate total amount
reservationSchema.statics.calculateTotal = async function(roomNos, duration) {
  const Room = mongoose.model('Room');
  const rooms = await Room.find({ RoomNo: { $in: roomNos } });
  return rooms.reduce((sum, room) => sum + room.RPrice, 0) * duration;
};

module.exports = mongoose.model('Reservation', reservationSchema);
