// utils/cryptoHelper.js
import CryptoJS from 'crypto-js';

// This should match the secret key used on the server
// Get the secret key from environment variables or use a fallback for development
const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY || '2fe8e8738d3a44507097930794fce58f6cbc9a329ee09cdd7ffaa72f627b9238';

export const encrypt = (data) => {
  try {
    if (!data) return null;
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedString) {
      throw new Error('Decryption failed - empty result');
    }
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
};