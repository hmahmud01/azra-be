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

    const findMobileSetting = async(id) => {
        console.log(id);
        const setting = await db.mobilesetting.findOne({
            where: {
                uuid: id
            }
        })
        console.log(setting);
        return setting;

    }

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
            let usertype = existingUser.usertype
            let store = existingUser.store
            let uuid = existingUser.uuid
            res.json({
                accessToken,
                refreshToken,
                uid,
                uuid,
                usertype,
                store
            });
        } catch (err) {
            next(err);
        }
    });

    authRoute.post('/applogin', async(req,res,next) => {
        try {
            const username = req.body.username
            const password = req.body.password

            console.log("username , password")

            if (!username || !password){
                res.status(200).json({
                    msg: "EMAIL AND PASSSWORD NECESSARY"
                }) 
                throw new Error('You must provide an email and a password.');
            }

            const existingUser = await findUserByPhone(username);

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
            let usertype = existingUser.usertype
            let store = existingUser.store
            let uuid = existingUser.uuid
            let email = existingUser.email
            let phone = existingUser.phone
            let status = existingUser.status
            let address = "addr"
            let setting = {}

            let countryServices = []

            const countries = await db.country.findAll()
            
            for (let i=0; i<countries.length; i++){
                let cid = countries[i].uuid
                let networkdata = []
                const network = await db.mobile.findAll({
                    where: {
                        countryId: cid
                    }
                })

                for (let j=0; j<network.length; j++){

                    const settingdata = db.mobilesetting.findOne({
                        where: {
                            mobileId: network[j].uuid
                        }
                    }).then(data => {
                        if (data){
                            console.log(data.logo);
                            let settingdat = {
                                name: network[j].name,
                                group: "recharge",
                                category: "mobile",
                                type: "operator",
                                logo: data.logo,
                                service_code: data.serviceCode,
                                calling_code: [
                                    data.callingCode,
                                ],
                                settings: {
                                    code: data.serviceCode,
                                    regex: data.regex,
                                    max_length: data.max_length,
                                    data: []
                                },
                                config: {
                                    code: data.api_code,
                                    regex: data.regex,
                                    denomination_step: data.denominationStep
                                },
                                country_code: countries[i].short,
                                data : [
                                    countries[i].name,
                                    countries[i].name,
                                    countries[i].short,
                                    data.callingCode,
                                ]
                            }
                            networkdata.push(settingdat);
                            console.log(networkdata);
                        }
                    })

                    // let data = {
                    //     name: network[j].name,
                    //     group: "recharge",
                    //     category: "mobile",
                    //     type: "operator",
                    //     logo: "GRAMEEN_PHONE",
                    //     service_code: "MR",
                    //     calling_code: [
                    //         "880",
                    //     ],
                    //     settings: {
                    //         code: "MR",
                    //         regex: "",
                    //         max_length: 11,
                    //         data: []
                    //     },
                    //     config: {
                    //         code: "ETS",
                    //         regix: "",
                    //         denomination_step: 5
                    //     },
                    //     country_code: countries[i].short,
                    //     data : [
                    //         ""
                    //     ]
                    // }
                    // networkdata.push(data);
                }

                let countryData = {
                    name: countries[i].name,
                    iso_2: countries[i].short,
                    services: networkdata
                }
                countryServices.push(countryData);
                console.log(countryServices);
            }

            console.log("outside loop country services");
            console.log(countryServices);

            const data = {
                status: status,
                balance: 0.111,
                address: address,
                currency: "United Arab Emirates Dirham",
                email: email,
                contact_no: phone,
                post: "Customer",
                credit_limit: "0.000000",
                reward_enabled: false,
                service_status: {
                    status: "running",
                    header: "Sorry",
                    content: "Application is under construction",
                    description: "",
                    highlight: "WILL BE COMPLETED WITHIN 04:30 AM",
                    min_app_version: "68",
                    latest_app_version: "76"
                },
                min_app_version: "68",
                latest_app_version: "76",
                server_address: process.env.SERVER_URL,
                countries: countryServices,
                has_token: accessToken,
	            auth_id: uuid
            }

            res.json({data});

        } catch (error) {
            res.status(200).json({
                message: error
            })
        }
        
        


    })

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

