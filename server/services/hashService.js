/**
 * hashService.js
 * Tạo mã băm SHA-256 từ nội dung file hoặc text
 * Mã băm này được dùng để lưu lên Smart Contract (on-chain)
 */
const crypto = require('crypto');

/**
 * Băm nội dung buffer
 * @param {Buffer} buffer
 * @returns {string} hex string
 */
function hashBuffer(buffer) {
  return '0x' + crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Băm JSON object
 * @param {Object} obj
 * @returns {string} hex string
 */
function hashObject(obj) {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  return '0x' + crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Băm chuỗi văn bản
 * @param {string} text
 * @returns {string} hex string
 */
function hashText(text) {
  return '0x' + crypto.createHash('sha256').update(text).digest('hex');
}

module.exports = { hashBuffer, hashObject, hashText };
