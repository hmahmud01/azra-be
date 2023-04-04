import express from 'express';
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from '../utls/jwt.js';
import { addRefreshTokenToWhitelist } from './auth.services.js';
import bcrypt from 'bcrypt';
import { db } from '../utls/db.js';

const authRoute = express.Router();

import { findUserByEmail, createUserByEmailAndPassword, findUserByPhone, createSuperUser } from '../users/users.services.js';

authRoute.get('/users', async (req, res, next) => {
    const users = await db.user.findMany();
    const result = []

    for (let i = 0; i < users.length; i++) {
        let data = {
            id: users[i].id,
            uuid: users[i].uuid,
            email: users[i].email,
            phone: users[i].phone,
            store: users[i].store,
            createdAt: users[i].createdAt,
            updatedAt: users[i].updatedAt,
            type: users[i].type,
            status: users[i].status
        }

        result.push(data)
    }
    res.status(200).json({
        message: result
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
    const user = await createSuperUser(req.body);

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
        res.json({
            accessToken,
            refreshToken,
            uid,
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

// module.exports = authRoute;
export default authRoute;