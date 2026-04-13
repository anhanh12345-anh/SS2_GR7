const cron = require('node-cron');
const Debt = require('../models/Debt');
const Reminder = require('../models/Reminder');

const startReminderJob = () => {
  cron.schedule('* * * * *', async () => {
    console.log('⏰ Running reminder job...');

    const now = new Date();

    // 1 ngày trước hạn
    const nextDay = new Date();
    nextDay.setDate(now.getDate() + 1);

    try {
      const debts = await Debt.find({
        status: 'pending',
        dueDate: { $lte: nextDay },
        reminderSent: false,
      });

      for (let debt of debts) {
        let message = '';

        if (debt.dueDate < now) {
          message = `⚠️ Khoản nợ với ${debt.personName} đã quá hạn!`;
        } else {
          message = `⏰ Khoản nợ với ${debt.personName} sắp đến hạn!`;
        }

        await Reminder.create({
          userId: debt.userId,
          debtId: debt._id,
          message,
        });

        debt.reminderSent = true;
        await debt.save();
      }
    } catch (err) {
      console.error('Reminder job error:', err.message);
    }
  });
};

module.exports = { startReminderJob };