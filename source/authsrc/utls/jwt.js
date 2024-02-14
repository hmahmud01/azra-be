// import jwt from 'jsonwebtoken';

const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  console.log(process.env.JWT_ACCESS_SECRET);
  return jwt.sign({ userId: user.id }, "azraaccesstoken", {
    expiresIn: '10m',
  });
}

function generateRefreshToken(user, jti) {
  return jwt.sign({
    userId: user.id,
    jti
  }, "refreshtoken", {
    expiresIn: '24h',
  });
}

function generateTokens(user, jti) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);
  // const refreshToken = generateRefreshToken(user);
  console.log(`accesstoken ${accessToken} and refreshtoken ${refreshToken}`)
  return {
    accessToken,
    refreshToken,
  };
}

module.exports = {
  generateTokens
}
