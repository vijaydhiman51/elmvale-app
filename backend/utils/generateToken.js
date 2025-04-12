const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '10m') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.TEMP_JWT_EXPIRATION || expiresIn });
};

module.exports = generateToken;