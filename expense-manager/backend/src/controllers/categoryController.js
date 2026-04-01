const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ isDefault: -1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    const existing = await Category.findOne({ name, type, user: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ user: req.user._id, name, type, icon, color });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if category has transactions
    const txCount = await Transaction.countDocuments({ category: category._id });
    if (txCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${txCount} transactions`
      });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
