const express = require("express");
const Debt = require("../models/Debt");
const DebtTransaction = require("../models/DebtTransaction");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Create debt
router.post("/", async (req, res) => {
  try {
    const debt = await Debt.create({
      ...req.body,
      userId: req.user._id,
    });
    res.json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all
router.get("/", async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.user._id });
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Repay
router.post("/:id/repay", async (req, res) => {
  try {
    const { amount } = req.body;

    const debt = await Debt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!debt) {
      return res.status(404).json({ error: "Debt not found" });
    }

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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update debt
router.put("/:id", async (req, res) => {
  try {
    const debt = await Debt.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!debt) {
      return res.status(404).json({ error: "Debt not found" });
    }

    res.json(debt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete debt
router.delete("/:id", async (req, res) => {
  try {
    const debt = await Debt.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!debt) {
      return res.status(404).json({ error: "Debt not found" });
    }

    res.json({ message: "Debt deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;