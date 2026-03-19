const express = require('express');
const router = express.Router();
const { getReport, exportExcel, exportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getReport);
router.get('/export/excel', exportExcel);
router.get('/export/pdf', exportPDF);

module.exports = router;
