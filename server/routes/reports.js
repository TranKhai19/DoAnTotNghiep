/**
 * Routes for Campaign Reports (Luồng 4)
 * Staff submits post-campaign report, Admin closes on-chain
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const reportController = require('../controllers/reportController');
const { verifyToken, detectUser, requireAdmin } = require('../middlewares/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Xem danh sách báo cáo (Công khai + detect user để hiện pending cho staff/admin)
router.get('/', detectUser, reportController.listReports);

// Staff: Tạo báo cáo nghiệm thu (kèm ảnh hóa đơn)
router.post('/', verifyToken, upload.array('invoice_files', 20), reportController.createReport);

// Admin: Nghiệm thu + đóng chiến dịch on-chain
router.post('/:id/close-campaign', verifyToken, requireAdmin, reportController.closeWithReport);

// Admin: Duyệt/Từ chối báo cáo
router.post('/:id/approve', verifyToken, requireAdmin, reportController.approveReport);
router.post('/:id/reject', verifyToken, requireAdmin, reportController.rejectReport);

module.exports = router;
