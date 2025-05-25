const CryptoJS = require("crypto-js");
const SECRET_KEY = process.env.SECRET_KEY;

// Encrypt Data
exports.encryptToken = (token) => {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
};

// Decrypt Data
exports.decryptToken = (encryptedToken) => {
  const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
