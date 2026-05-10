const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    personName: { type: String, required: true },
    type: {
      type: String,
      enum: ["borrow", "lend"],
      required: true,
    },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    note: String,
     borrowDate: Date,
    dueDate: Date,
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Debt", debtSchema);