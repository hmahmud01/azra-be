// import { db } from '../utls/db.js';
// import { hashToken } from '../utls/hashToken.js';
const db = require("../../models");
const { hashToken } = require("../utls/hashToken.js");
const jwt = require("jsonwebtoken");

const RefreshToken = db.refreshtoken;

const authMiddleware = async (req, res, next) => {
  const AuthId = req.get('AuthId')
  console.log(`AuthId ${AuthId}`)

  if(!AuthId) {
      return res.status(401).json({success: false, message: "Session Not Available"})
  }

  try {
      const decoded = jwt.verify(AuthId, "azraaccesstoken");
      console.log(`decoded ${decoded}`)
      req.user = decoded;
      next()
  } catch (err) {
      console.log(err);
      return res.status(401).json({ success: false, message: "Session Expired. Please Login again" });
  }
}

// used when we create a refresh token.
function addRefreshTokenToWhitelist({ jti, refreshToken, userId }) {
  return RefreshToken.create({
    data: {
      // id: jti,
      hashedToken: hashToken(refreshToken),
      userId
    },
  });
}

// used to check if the token sent by the client is in the database.
function findRefreshTokenById(id) {
  return RefreshToken.findOne({
    where: {
      id,
    },
  });
}

// soft delete tokens after usage.
function deleteRefreshToken(id) {
  return RefreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true
    }
  });
}

function revokeTokens(userId) {
  return RefreshToken.update({
    where: {
      userId
    },
    data: {
      revoked: true
    }
  });
}

module.exports = {
  authMiddleware,
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens
}