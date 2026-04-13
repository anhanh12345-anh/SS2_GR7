const express = require("express");
const Debt = require("../models/Debt");
const DebtTransaction = require("../models/DebtTransaction");

const router = express.Router();

// ➕ Create debt
router.post("/", async (req, res) => {
  try {
    const debt = await Debt.create(req.body);
    res.json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📋 Get all
router.get("/", async (req, res) => {
  const debts = await Debt.find();
  res.json(debts);
});

// 💸 Repay
router.post("/:id/repay", async (req, res) => {
  const { amount } = req.body;

  const debt = await Debt.findById(req.params.id);
  debt.paidAmount += amount;

  if (debt.paidAmount >= debt.totalAmount) {
    debt.status = "paid";
  }

  await debt.save();

  await DebtTransaction.create({
    debtId: debt._id,
    amount,
    type: "repay",
  });

  res.json(debt);
});

module.exports = router;