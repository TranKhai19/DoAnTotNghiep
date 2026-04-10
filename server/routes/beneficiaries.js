const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const controller = require('../controllers/beneficiaryController');

// GET /api/beneficiaries
router.get('/', controller.getAll);

// GET /api/beneficiaries/:id
router.get('/:id', controller.getById);

// POST /api/beneficiaries (multipart/form-data, image field: 'image')
router.post('/', upload.single('image'), controller.create);

// PUT /api/beneficiaries/:id
router.put('/:id', upload.single('image'), controller.update);

// DELETE /api/beneficiaries/:id
router.delete('/:id', controller.remove);

module.exports = router;
