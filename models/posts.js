
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    RoomNo: { 
        type: Number, 
        required: true,
        min: 1,
        unique: true
    },
    RStatus: {
        type: String,
        required: true,
        enum: ["Booked", "Vacant", "Occupied", "Out of Service"]
    },
    RType: {
        type: String,
        required: true,
        enum: ["Single", "Double"]
    },
    RClass: {
        type: String,
        required: true,
        enum: ["Standard", "Deluxe"]
    },
    Price: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);