const crypto = require('crypto');

/**
 * Generate a random temporary password
 * @param {number} length - Length of the password (default: 8)
 * @returns {string} - Random password
 */
const generateTempPassword = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
};

/**
 * Generate a secure random token
 * @param {number} length - Length of the token in bytes (default: 32)
 * @returns {string} - Random hex token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Check if a date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} - True if expired
 */
const isExpired = (date) => {
  return new Date() > new Date(date);
};

/**
 * Get expiration date (24 hours from now)
 * @returns {Date} - Expiration date
 */
const getTempPasswordExpiration = () => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 24);
  return expiration;
};

module.exports = {
  generateTempPassword,
  generateSecureToken,
  isExpired,
  getTempPasswordExpiration
};
