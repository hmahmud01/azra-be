const crypto = require('crypto');

function hashToken(token) {
  return crypto.createHash('sha512').update(token).digest('hex');
}

module.exports = { hashToken };

// https://dev.to/mihaiandrei97/jwt-authentication-using-prisma-and-express-37nk