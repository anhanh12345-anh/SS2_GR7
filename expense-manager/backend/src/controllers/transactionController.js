const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

exports.getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate, minAmount, maxAmount, search, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }
    if (search) {
      filter.note = { $regex: search, $options: 'i' };
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon color type')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: transactions,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, note, tags } = req.body;

    const cat = await Category.findOne({ _id: category, user: req.user._id });
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const transaction = await Transaction.create({
      user: req.user._id, type, amount, category, date, note, tags
    });

    await transaction.populate('category', 'name icon color type');

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name icon color type');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = month ? Number(month) : now.getMonth() + 1;
    const targetYear = year ? Number(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('category', 'name icon color type');

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // Category breakdown for expenses
    const expenseByCategory = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const catName = t.category?.name || 'Unknown';
      if (!expenseByCategory[catName]) {
        expenseByCategory[catName] = { amount: 0, icon: t.category?.icon, color: t.category?.color, categoryId: t.category?._id };
      }
      expenseByCategory[catName].amount += t.amount;
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYear, targetMonth - 1 - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthTx = await Transaction.find({
        user: req.user._id,
        date: { $gte: start, $lte: end }
      });

      monthlyTrend.push({
        month: d.toLocaleString('vi-VN', { month: 'short', year: 'numeric' }),
        income: monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      });
    }

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        expenseByCategory,
        monthlyTrend,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [monthTransactions, recentTransactions] = await Promise.all([
      Transaction.find({ user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } }).populate('category', 'name icon color'),
      Transaction.find({ user: req.user._id }).sort({ date: -1 }).limit(5).populate('category', 'name icon color')
    ]);

    const totalIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        recentTransactions,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
