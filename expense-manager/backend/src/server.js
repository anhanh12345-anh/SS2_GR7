const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// 🔔 Cron job
const { startReminderJob } = require('./jobs/reminderJob');

// Load env
dotenv.config();

const app = express();

// ======================
// 🔧 MIDDLEWARE
// ======================

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP'
  }
});
app.use('/api/', limiter);

// ======================
// 📌 ROUTES
// ======================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/reminders', require('./routes/reminders'));

// 💸 NEW: Debt routes
app.use('/api/debts', require('./routes/debtRoutes'));

// ======================
// ❤️ HEALTH CHECK
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ======================
// ❌ ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ======================
// 🛢️ DATABASE + SERVER
// ======================

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/expense_manager';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');

  // 🔔 Start reminder job
  try {
    startReminderJob();
    console.log('⏰ Reminder job started');
  } catch (err) {
    console.error('Reminder job error:', err.message);
  }

  // 🚀 Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});