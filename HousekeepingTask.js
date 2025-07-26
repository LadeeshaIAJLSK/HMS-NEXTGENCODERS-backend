const mongoose = require('mongoose');

const housekeepingTaskSchema = new mongoose.Schema({
  roomNumber: String,
  status: {
    type: String,
    enum: ['Dirty', 'In Progress', 'Clean'],
    default: 'Dirty',
  },
  readyTime: String,
});

module.exports = mongoose.model('HousekeepingTask', housekeepingTaskSchema);
