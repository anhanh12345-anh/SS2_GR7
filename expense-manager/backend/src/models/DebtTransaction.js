const mongoose = require("mongoose");

const debtTransactionSchema = new mongoose.Schema(
  {
    debtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Debt",
      required: true,
    },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["repay", "borrow_more"],
      required: true,
    },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DebtTransaction", debtTransactionSchema);