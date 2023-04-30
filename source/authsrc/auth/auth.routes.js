// import express from 'express';
// import { v4 as uuidv4 } from "uuid";
// import { generateTokens } from '../utls/jwt.js';
// import { addRefreshTokenToWhitelist } from './auth.services.js';
// import bcrypt from 'bcrypt';
// import { db } from '../utls/db.js';

module.exports = app => {
    const express = require("express");
    const { v4: uuidv4 } = require("uuid")
    const { generateTokens } = require("../utls/jwt.js");
    const { addRefreshTokenToWhitelist } = require("./auth.services.js");
    const bcrypt = require("bcrypt");
    const db = require("../../models");
    const User = db.user

    const authRoute = express.Router();
    // import { findUserByEmail, createUserByEmailAndPassword, findUserByPhone, createSuperUser } from '../users/users.services.js';
    const { findUserByPhone, createUserByEmailAndPassword, createSuperUser  } = require("../users/users.services.js")

    authRoute.get('/users', async (req, res, next) => {
        // const users = await User.findAll({
        //     select:{
        //         id: true,
        //         uuid: true,
        //         email: true,
        //         phone: true,
        //         store: true,
        //         createdAt: true,
        //         updatedAt: true,
        //         type: true,
        //         status: true
        //     }
        // });

        const users = await User.findAll();
        res.status(200).json({
            message: users
        })
    })

    authRoute.post('/register', async (req, res, next) => {
        console.log("INSIDE AUTH ROUTE");
        console.log(req.body)

        const dataTYPE = {
            fname: 'frist',
            lname: 'last',
            email: 'hma@test.com',
            phone: '2364',
            password: '124',
            type: 'agent',
            address: 'addr',
            ref: 11,
            age: '23'
        }

        try {
            const { email, phone, password } = req.body;
            if (!email || !password || !phone) {
                res.status(400);
                throw new Error('You must provide an email and a password.');
            }

            const existingUser = await findUserByPhone(phone);

            if (existingUser) {
                res.status(400);
                throw new Error('Email already in use.');
            }
            const user = await createUserByEmailAndPassword(req.body);
            const jti = uuidv4();
            const { accessToken, refreshToken } = generateTokens(user, jti);
            await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
            let msg = "User Created Successfully"
            res.json({
                accessToken,
                refreshToken,
                msg
            });
        } catch (err) {
            next(err);
        }
    });

    authRoute.post('/createsuperuser', async (req, res, next) => {
        const user = await createSuperUser(req.body).catch((err) => console.log(err));

        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

        res.status(200).json({
            accessToken,
            refreshToken
        });
    })

    authRoute.post('/login', async (req, res, next) => {
        console.log("checking")
        try {
            const { phone, password } = req.body;
            if (!phone || !password) {
                res.status(400);
                throw new Error('You must provide an email and a password.');
            }

            const existingUser = await findUserByPhone(phone);

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

            let uid = existingUser.id
            let type = existingUser.type
            let store = existingUser.store
            let uuid = existingUser.uuid
            res.json({
                accessToken,
                refreshToken,
                uid,
                uuid,
                type,
                store
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

    app.use('/', authRoute);

    // module.exports = authRoute;
    // export default authRoute;
}

