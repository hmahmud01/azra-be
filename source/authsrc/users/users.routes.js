// const express = require('express');
// const { isAuthenticated } = require('../../middlewares');
// const { findUserById } = require('./users.services');

import express from 'express';
import { isAuthenticated } from '../middlewares.js';
import { findUserById } from '../users/users.services.js';

const usersRoute = express.Router();

usersRoute.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUserById(userId);
    delete user.password;
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default usersRoute;
