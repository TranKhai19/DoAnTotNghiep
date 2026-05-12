/**
 * Routes for Disbursement Requests (Luồng 3)
 * Staff creates, Admin approves/rejects
 */
const express = require('express');
const router = express.Router();
const multer = require('multer');
const disbursementController = require('../controllers/disbursementController');
const { verifyToken, requireAdmin, requireStaff } = require('../middlewares/auth');

// Store files in memory for IPFS upload
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// Staff + Admin: Xem danh sách yêu cầu giải ngân
router.get('/', verifyToken, disbursementController.listDisbursements);

// Staff: Tạo yêu cầu giải ngân (kèm file IPFS)
router.post('/', verifyToken, requireStaff, upload.array('proof_files', 10), disbursementController.createDisbursement);

// Admin: Duyệt yêu cầu (gọi on-chain)
router.post('/:id/approve', verifyToken, requireAdmin, disbursementController.approveDisbursement);

// Admin: Từ chối yêu cầu
router.post('/:id/reject', verifyToken, requireAdmin, disbursementController.rejectDisbursement);

module.exports = router;
