// const { v4: uuidv4 } = require('uuid');
// const { generateTokens } = require('../../utils/jwt');
// const {
//   addRefreshTokenToWhitelist,
// } = require('./auth.services');
// const jwt = require('jsonwebtoken');
import express from 'express';
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from '../utls/jwt.js';
import { addRefreshTokenToWhitelist } from './auth.services.js';
import bcrypt from 'bcrypt';

const authRoute = express.Router();
// const {
//   findUserByEmail,
//   createUserByEmailAndPassword,
// } = require('../users/users.services');

import {findUserByEmail, createUserByEmailAndPassword} from '../users/users.services.js';

authRoute.post('/register', async (req, res, next) => {
  console.log("INSIDE AUTH ROUTE");
  try {
    const { email, phone, password } = req.body;
    if (!email || !password || !phone) {
      res.status(400);
      throw new Error('You must provide an email and a password.');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('Email already in use.');
    }

    const type = "agent"

    const user = await createUserByEmailAndPassword({ email, phone , password , type});
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

authRoute.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400);
        throw new Error('You must provide an email and a password.');
      }
  
      const existingUser = await findUserByEmail(email);
  
      if (!existingUser) {
        res.status(403);
        throw new Error('Invalid login credentials.');
      }
  
      const validPassword = await bcrypt.compare(password, existingUser.password);
      if (!validPassword) {
        res.status(403);
        throw new Error('Invalid login credentials.');
      }
  
      const jti = uuidv4();
      const { accessToken, refreshToken } = generateTokens(existingUser, jti);
      await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });
  
      res.json({
        accessToken,
        refreshToken
      });
    } catch (err) {
      next(err);
    }
  });
  
  authRoute.post('/refreshToken', async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400);
        throw new Error('Missing refresh token.');
      }
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const savedRefreshToken = await findRefreshTokenById(payload.jti);
  
      if (!savedRefreshToken || savedRefreshToken.revoked === true) {
        res.status(401);
        throw new Error('Unauthorized');
      }
  
      const hashedToken = hashToken(refreshToken);
      if (hashedToken !== savedRefreshToken.hashedToken) {
        res.status(401);
        throw new Error('Unauthorized');
      }
  
      const user = await findUserById(payload.userId);
      if (!user) {
        res.status(401);
        throw new Error('Unauthorized');
      }
  
      await deleteRefreshToken(savedRefreshToken.id);
      const jti = uuidv4();
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
      await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });
  
      res.json({
        accessToken,
        refreshToken: newRefreshToken
      });
    } catch (err) {
      next(err);
    }
  });
  
  // This endpoint is only for demo purpose.
  // Move this logic where you need to revoke the tokens( for ex, on password reset)
  authRoute.post('/revokeRefreshTokens', async (req, res, next) => {
    try {
      const { userId } = req.body;
      await revokeTokens(userId);
      res.json({ message: `Tokens revoked for user with id #${userId}` });
    } catch (err) {
      next(err);
    }
  });

// module.exports = authRoute;
export default authRoute;