const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['daily', 'bill', 'custom'],
    default: 'custom'
  },
  dueDate: {
    type: Date
  },
  amount: {
    type: Number,
    default: 0
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDay: {
    type: Number,
    min: 1,
    max: 31
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
