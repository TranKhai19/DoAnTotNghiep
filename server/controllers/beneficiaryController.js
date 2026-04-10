const Beneficiary = require('../models/Beneficiary');
const cloudinary = require('../config/cloudinary');

// Helper: upload buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'beneficiaries', public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

const getAll = async (req, res, next) => {
  try {
    const data = await Beneficiary.getAllBeneficiaries();
    res.json(data);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await Beneficiary.getBeneficiaryById(id);
    if (!data) return res.status(404).json({ error: 'Beneficiary not found' });
    res.json(data);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    let image_url = null;
    let image_public_id = null;

    if (req.file && req.file.buffer) {
      const filename = `${Date.now()}_${(req.file.originalname || 'img').replace(/\.[^/.]+$/, '')}`;
      const result = await uploadBufferToCloudinary(req.file.buffer, filename);
      image_url = result.secure_url;
      image_public_id = result.public_id;
    }

    const created = await Beneficiary.createBeneficiary({ name, email, phone, address, image_url, image_public_id });
    res.status(201).json(created);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, email, phone, address } = req.body;
    let image_url = undefined;
    let image_public_id = undefined;

    if (req.file && req.file.buffer) {
      // If replacing an image, attempt to remove the old one first
      try {
        const existing = await Beneficiary.getBeneficiaryById(id);
        if (existing && existing.image_public_id) {
          await cloudinary.uploader.destroy(existing.image_public_id);
        }
      } catch (e) {
        // log and continue
        console.warn('Could not delete existing image from Cloudinary:', e.message || e);
      }

      const filename = `${Date.now()}_${(req.file.originalname || 'img').replace(/\.[^/.]+$/, '')}`;
      const result = await uploadBufferToCloudinary(req.file.buffer, filename);
      image_url = result.secure_url;
      image_public_id = result.public_id;
    }

    const updated = await Beneficiary.updateBeneficiary(id, { name, email, phone, address, image_url, image_public_id });
    res.json(updated);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    // delete image from Cloudinary if exists
    try {
      const existing = await Beneficiary.getBeneficiaryById(id);
      if (existing && existing.image_public_id) {
        await cloudinary.uploader.destroy(existing.image_public_id);
      }
    } catch (e) {
      console.warn('Could not delete image from Cloudinary during beneficiary delete:', e.message || e);
    }

    const deleted = await Beneficiary.deleteBeneficiary(id);
    res.json(deleted);
  } catch (err) { next(err); }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
