const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Category = require('../models/Category');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const defaultCategories = [
  // Income
  { name: 'Lương', type: 'income', icon: '💼', color: '#10b981' },
  { name: 'Thưởng', type: 'income', icon: '🎁', color: '#06b6d4' },
  { name: 'Thu nhập thêm', type: 'income', icon: '💡', color: '#8b5cf6' },
  { name: 'Đầu tư', type: 'income', icon: '📈', color: '#f59e0b' },
  { name: 'Khác', type: 'income', icon: '💰', color: '#6b7280' },
  // Expense
  { name: 'Ăn uống', type: 'expense', icon: '🍔', color: '#ef4444' },
  { name: 'Mua sắm', type: 'expense', icon: '🛍️', color: '#f97316' },
  { name: 'Đi lại', type: 'expense', icon: '🚗', color: '#eab308' },
  { name: 'Hóa đơn', type: 'expense', icon: '📄', color: '#3b82f6' },
  { name: 'Giải trí', type: 'expense', icon: '🎮', color: '#a855f7' },
  { name: 'Sức khỏe', type: 'expense', icon: '🏥', color: '#ec4899' },
  { name: 'Giáo dục', type: 'expense', icon: '📚', color: '#14b8a6' },
  { name: 'Du lịch', type: 'expense', icon: '✈️', color: '#6366f1' },
  { name: 'Nhà ở', type: 'expense', icon: '🏠', color: '#84cc16' },
  { name: 'Khác', type: 'expense', icon: '💸', color: '#6b7280' },
];

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    // Create default categories
    const cats = defaultCategories.map(c => ({ ...c, user: user._id, isDefault: true }));
    await Category.insertMany(cats);

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, currency: user.currency, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, currency } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, currency },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({ success: true, message: 'Password reset token generated', resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successful', token: jwtToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
