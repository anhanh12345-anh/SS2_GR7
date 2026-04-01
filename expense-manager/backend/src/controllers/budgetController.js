const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month: targetMonth,
      year: targetYear,
      isActive: true
    }).populate('category', 'name icon color');

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(budgets.map(async (budget) => {
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const filter = {
        user: req.user._id,
        type: 'expense',
        date: { $gte: startDate, $lte: endDate }
      };

      if (budget.category) {
        filter.category = budget.category._id;
      }

      const transactions = await Transaction.find(filter);
      const spent = transactions.reduce((s, t) => s + t.amount, 0);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        ...budget.toObject(),
        spent,
        percentage: Math.min(percentage, 100),
        isOverBudget: spent > budget.amount,
        isNearLimit: percentage >= budget.alertThreshold && spent <= budget.amount
      };
    }));

    res.json({ success: true, data: budgetsWithSpending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const budget = await Budget.create({ ...req.body, user: req.user._id });
    await budget.populate('category', 'name icon color');
    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    ).populate('category', 'name icon color');

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
