module.exports = app => {
    const express = require('express');
    const { isAuthenticated } = require('../middlewares.js');
    const { findUserById } = require('./users.services');
    
    
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

    app.use('/', usersRoute);
}
