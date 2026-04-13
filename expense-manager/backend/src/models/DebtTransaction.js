import mongoose from "mongoose";

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

export default mongoose.model("DebtTransaction", debtTransactionSchema);