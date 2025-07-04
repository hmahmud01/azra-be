// import { createHash } from 'crypto';
const { createHash } = require("crypto");

function hashToken(token) {
  return createHash('sha512').update(token).digest('hex');
}

module.exports = {
  hashToken
}


// https://dev.to/mihaiandrei97/jwt-authentication-using-prisma-and-express-37nk