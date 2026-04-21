const Transaction = require('../models/Transaction');

exports.getReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('category', 'name icon color type')
      .sort({ date: -1 });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    res.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          count: transactions.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportExcel = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const xlsx = require('xlsx');

    const filter = { user: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('category', 'name')
      .sort({ date: -1 });

    const data = transactions.map(t => ({
      'Loại': t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
      'Số tiền': t.amount,
      'Danh mục': t.category?.name || 'N/A',
      'Ngày': new Date(t.date).toLocaleDateString('vi-VN'),
      'Ghi chú': t.note || ''
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Giao dịch');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=bao-cao.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const PDFDocument = require('pdfkit');

    const filter = { user: req.user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('category', 'name')
      .sort({ date: -1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Disposition', 'attachment; filename=bao-cao.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20).text('BAO CAO TAI CHINH', { align: 'center' });
    doc.moveDown();

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    doc.fontSize(12).text(`Tong thu nhap: ${totalIncome.toLocaleString('vi-VN')} VND`);
    doc.text(`Tong chi tieu: ${totalExpense.toLocaleString('vi-VN')} VND`);
    doc.text(`So du: ${(totalIncome - totalExpense).toLocaleString('vi-VN')} VND`);
    doc.moveDown();

    doc.fontSize(10);
    transactions.forEach(t => {
      doc.text(`${new Date(t.date).toLocaleDateString('vi-VN')} | ${t.type === 'income' ? 'Thu' : 'Chi'} | ${t.category?.name} | ${t.amount.toLocaleString('vi-VN')} VND | ${t.note || ''}`);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
