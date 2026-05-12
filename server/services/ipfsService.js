/**
 * ipfsService.js
 * Upload files lên IPFS qua Pinata API
 */
const axios = require('axios');
const FormData = require('form-data');

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * Upload buffer lên IPFS, trả về CID và URL công khai
 * @param {Buffer} buffer - file buffer
 * @param {string} fileName - tên file
 * @param {string} mimeType - MIME type
 * @returns {{ cid, ipfsUrl, gatewayUrl }}
 */
async function uploadFileToIPFS(buffer, fileName, mimeType) {
  if (!PINATA_JWT) throw new Error('PINATA_JWT is not set in .env');

  const formData = new FormData();
  formData.append('file', buffer, { filename: fileName, contentType: mimeType });
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));
  formData.append('pinataMetadata', JSON.stringify({ name: fileName }));

  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        ...formData.getHeaders()
      },
      maxBodyLength: Infinity
    }
  );

  const cid = response.data.IpfsHash;
  return {
    cid,
    ipfsUrl: `ipfs://${cid}`,
    gatewayUrl: `${PINATA_GATEWAY}/${cid}`
  };
}

/**
 * Upload JSON metadata lên IPFS
 * @param {Object} metadata
 * @param {string} name
 * @returns {{ cid, ipfsUrl, gatewayUrl }}
 */
async function uploadJsonToIPFS(metadata, name = 'metadata.json') {
  if (!PINATA_JWT) throw new Error('PINATA_JWT is not set in .env');

  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    {
      pinataOptions: { cidVersion: 1 },
      pinataMetadata: { name },
      pinataContent: metadata
    },
    {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const cid = response.data.IpfsHash;
  return {
    cid,
    ipfsUrl: `ipfs://${cid}`,
    gatewayUrl: `${PINATA_GATEWAY}/${cid}`
  };
}

module.exports = { uploadFileToIPFS, uploadJsonToIPFS };
