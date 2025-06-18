// utils/cryptoHelper.js
const CryptoJS = require('crypto-js');

const encrypt = (data, secret) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString();
};

const decrypt = (ciphertext, secret) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

module.exports = { encrypt, decrypt };
