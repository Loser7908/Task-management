// middleware/cryptoMiddleware.js
const CryptoJS = require('crypto-js');

const CRYPTO_SECRET = process.env.CRYPTO_SECRET;

// Decrypt incoming request if 'data' property exists
exports.decryptRequest = (req, res, next) => {
  if (req.body && req.body.data) {
    try {
      const bytes = CryptoJS.AES.decrypt(req.body.data, CRYPTO_SECRET);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      req.body = decryptedData;
    } catch (error) {
      return res.status(400).json({ message: 'Invalid encrypted data' });
    }
  }
  next();
};

// Encrypt outgoing response
exports.encryptResponse = (req, res, next) => {
  const oldJson = res.json;
  res.json = function (data) {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), CRYPTO_SECRET).toString();
    oldJson.call(this, { data: ciphertext });
  };
  next();
};
