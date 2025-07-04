// import express from 'express';
// import { v4 as uuidv4 } from "uuid";
// import { generateTokens } from '../utls/jwt.js';
// import { addRefreshTokenToWhitelist } from './auth.services.js';
// import bcrypt from 'bcrypt';
// import { db } from '../utls/db.js';

module.exports = app => {
    const jwt = require("jsonwebtoken");
    const express = require("express");
    const { v4: uuidv4 } = require("uuid")
    const { generateTokens } = require("../utls/jwt.js");
    const { addRefreshTokenToWhitelist } = require("./auth.services.js");
    const bcrypt = require("bcrypt");
    const db = require("../../models");
    const User = db.user
    const recharge = require("../../controllers/recharge.js");
    const { logger, accessLog } = require("../middlewares.js");

    const authRoute = express.Router();
    // import { findUserByEmail, createUserByEmailAndPassword, findUserByPhone, createSuperUser } from '../users/users.services.js';
    const { findUserByPhone, createUserByEmailAndPassword, createSuperUser, findUserType  } = require("../users/users.services.js")

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

    authRoute.post('/refresh-token', async(req, res, next) => {
        const AuthId = req.get('AuthId')
        const refreshToken = req.get('refresh_token')
        const username = req.body.username
        const existingUser = await findUserByPhone(username);

        console.log(`existing user ${existingUser.id}`)

        jwt.verify(refreshToken, "refreshtoken", 
        (err, decoded) => {
            if (err) {
                console.log("NEW REFRESH TOKEN")
                const jti = uuidv4();
                const { accessToken, refreshToken } = generateTokens(existingUser, jti);

                return res.json({accessToken, refreshToken})
            }
            else {
                console.log("ACCESS TOKEN REFRESHED")
                const accessToken = jwt.sign({userId: existingUser.id}, "azraaccesstoken", {
                    expiresIn: '10m'
                });

                return res.json({accessToken, refreshToken})
            }
        })
    })

    authRoute.post('/verifytoken', async (req, res, next) => {
        const AuthId = req.get('AuthId')
        const refresh_token = req.get('refresh_token')
        console.log(`AuthId ${AuthId}`)

        jwt.verify(refresh_token, "refreshtoken", 
        (err, decoded) => {
            if (err) {
                return res.status(406).json({message: 'Unauthorized'})
            }
            else {
                const accessToken = jwt.sign({ userId: user.id }, "azraaccesstoken", {
                        expiresIn: '24h',
                });

                return res.json({accessToken})
            }
        })



        if(!AuthId) {
            return res.status(401).json({success: false, message: "Invalid token"})
        }

        try {
            const decoded = jwt.verify(AuthId, "azraaccesstoken");
            console.log(`decoded ${decoded}`)
            req.user = decoded;
            return res.status(200).json({success: true})
        } catch (err) {
            console.log(err);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    })

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
        
        accessLog.info(`USER REGISTRATION -> ${JSON.stringify(req.body)}`)
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
        accessLog.info(`${req.body.phone}|WEB LOGIN API|}`)
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

    authRoute.post('/devicechangerequest', async(req, res, next) => {
        accessLog.info(`DEVICE CHANGE REQUEST|CHANGED DEVICE: ${req.body.username}}`)
        try {
            // const update_device = req.body.updateDevice;
            const username = req.body.username;

            console.log(`TO UPDATE DEVICE : ${update_device}`);

            const existingUser = await findUserByPhone(username);

            if (!existingUser) {
                res.status(403).json({
                    msg: "User Don't Exist"
                });
                throw new Error('Invalid login credentials.');
            }

            const deviceData = await db.userdevice.findOne({
                where: {
                    userId: existingUser.uuid
                }
            })


            const request = await db.userdevicerequest.create({
                deviceId: deviceData.uuid,
                updateDevice: null
            })

            console.log(`REQUETS CREATED, ${request}`)

            res.status(200).json({
                msg: "Request Created",
                request: request
            })

            
        }  catch (error) {
            res.status(200).json(
                {
                    "status": false,
                    "auth_id": "N/A"
                }
            )
        }
    })

    authRoute.get('/devicelist', async(req, res, next) => {
        accessLog.info(`ACCESS DEVICE LIST | WEB ADMIN`)
        const devicelist = await db.userdevice.findAll()
        let list = []
        for (let i of devicelist){
            const user = await db.user.findOne({
                where: {
                    uuid: i.userId
                }
            })
            let obj = {
                uuid: i.uuid,
                currentDevice: i.currentDevice,
                prevDevice: i.prevDevice,
                userId: user.phone,
                createdAt: i.createdAt
            }

            list.push(obj)
        }

        console.log(list)

        res.status(200).json({
            "status": true,
            "devicelist": list
        })
    })

    authRoute.post('/nullifycurrentdevice', async(req, res, next) => {
        accessLog.info(`NULIFY DEVICE REQUEST: ${req.body.device_uuid}}`)
        console.log("UUID ACCESSED : ", req.body.device_uuid)
        const device_uuid = req.body.device_uuid
        const device = await db.userdevice.findOne({
            where: {
                uuid: device_uuid
            }
        })


        const device_update = await db.userdevice.update(
            {
                prevDevice: device.currentDevice,
                currentDevice: null
            },
            {
                where:{
                    uuid: device_uuid
                }
            }
        )

        console.log("DEVICE INFO UPDATED WITH NULL VALUE FOR CURRENT DEVICE : ", device_update)
        res.status(200).json({
            message: "DEVICE INFO UPDATED WITH NULL VALUE FOR CURRENT DEVICE"
        })
    })

    authRoute.post('/updatedevice', async(req, res, next) => {
        try {
            const req_id = req.body.request_id

            const request = await db.userdevicerequest.findOne({
                where: {
                    uuid: req_id
                }
            })

            const device = await db.userdevice.findOne({
                where: {
                    uuid: request.deviceId
                }
            })

            let prevDev = device.currentDevice

            const updateDevice = await db.userdevice.update(
                {
                    prevDevice: prevDev,
                    currentDevice: request.updateDevice
                },
                {
                    where: {
                        uuid: request.deviceId
                    }
                }
            )

            console.log(`updated DEVICE : ${updateDevice}`)

            res.status(200).json({
                msg: "Device Updated",
                dev: updateDevice
            })


        }  catch (error) {
            res.status(200).json(
                {
                    "status": false,
                    "description": "Didn't worked"
                }
            )
        }
    })

    authRoute.post('/applogin', async(req,res,next) => {
        accessLog.info(`${req.body.username}|LOGIN API FROM APP|DEVICE : ${req.get('device')}`)
        
        // try {
            let device_db = ""
            const device_id = req.get('device')
            console.log(`DEVICE ID : ${device_id}`)

            const username = req.body.username
            const password = req.body.password

            // const userbalance = await recharge.userPortalBalance(username)

            console.log(username , password)

            if (!username || !password){
                res.status(403).json({
                    "status": false,
                    "auth_id": "N/A",
                    "desc": "Username or Password is not given"
                    
                }) ;
                throw new Error('You must provide an email and a password.');
            }

            const existingUser = await findUserByPhone(username);
            console.log("EXISTING USER : ", existingUser)

            if (!existingUser) {
                res.status(403).json({
                    "status": false,
                    "auth_id": "N/A",
                    "desc": "Invalid Login Credentials"
                    
                }) ;
                throw new Error('Invalid login credentials.');
            }

            const validPassword = await bcrypt.compare(password, existingUser.password);
            // console.log(v)
            if (!validPassword) {
                res.status(403).json({
                    "status": false,
                    "auth_id": "N/A",
                    "desc": "Invalid Login Credentials"
                    
                }) ;
                throw new Error('Invalid login credentials.');
            }

            const userbalance = await recharge.userPortalBalance(username)

            const profileData = await db.userprofile.findOne({
                where: {
                    userId: existingUser.uuid
                }
            })

            const deviceData = await db.userdevice.findOne({
                where: {
                    userId: existingUser.uuid
                }
            })

            console.log("checking device", deviceData);

            if (!deviceData){
                console.log("CREATING NEW DEVICE")
                const device = await db.userdevice.create({
                    currentDevice: device_id,
                    userId: existingUser.uuid
                })

                device_db = device.currentDevice
            }else{
                if(deviceData.currentDevice){
                    console.log("CURRENT DEVICE FOUND")
                    device_db = deviceData.currentDevice
                }else{
                    console.log("DEVICE NEEDS TO BE UPDATED")
                    const updateDevice = await db.userdevice.update(
                        {
                            prevDevice: deviceData.prevDevice,
                            currentDevice: device_id
                        },
                        {
                            where: {
                                userId: existingUser.uuid
                            }
                        }
                    )
    
                    // console.log("UPDATE DEVICE OBJECT : ", updateDevice)
                    const upddevice = await db.userdevice.findOne({
                        where: {
                            userId: existingUser.uuid
                        }
                    })

                    device_db = upddevice.currentDevice
                }
                
            }

            console.log(`CURRENT DEVICE : ${device_db}`)

            // if(device_db != device_id){
            //     res.status(403).json({
            //         "status": false,
            //         "auth_id": "N/A",
            //         "desc": "Device Not Matched. Please Use your original Device You logged in with."
                    
            //     }) ;
            //     throw new Error('Invalid DEVICE.');
            // }

            console.log("Device Matched");

            const post = findUserType(existingUser.usertype);

            const jti = uuidv4();
            const { accessToken, refreshToken } = generateTokens(existingUser, jti);
            await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.uuid });
            console.log( "user : ", existingUser.phone)
            console.log("post : ", post)

            if(post == "Sales") {
                res.json({
                    status: true,
                    name: existingUser.store,
                    phone: existingUser.phone,
                    superior: "admin",
                    post: post,
                    credit_limit: "0.00000",
                    balance: userbalance,
                    can_add_reseller: true,
                    min_app_version: "68",
                    latest_app_version: "76",
                    server_address: process.env.SERVER_URL,
                    has_token: accessToken,
                    auth_id: accessToken,
                    refresh_token: refreshToken,
                    user_id: existingUser.uuid
                    // superior: existingUser.connectedUsesr
                })
            }else if(post == "Sub Reseller") {
                const superiorUser = await db.user.findOne({
                    where: {
                        uuid: profileData.connectedUser
                    }
                })
                res.json({
                    status: true,
                    name: existingUser.store,
                    phone: existingUser.phone,
                    superior: superiorUser.store,
                    post: post,
                    credit_limit: "0.00000",
                    balance: userbalance,
                    can_add_customer: true,
                    min_app_version: "68",
                    latest_app_version: "76",
                    server_address: process.env.SERVER_URL,
                    has_token: accessToken,
                    auth_id: accessToken,
                    refresh_token: refreshToken,
                    user_id: existingUser.uuid
                })
            }else if(post == "Customer") {
                let uid = existingUser.id
                let usertype = existingUser.usertype
                let store = existingUser.store
                let uuid = existingUser.uuid
                let email = existingUser.email
                let phone = existingUser.phone
                let status = existingUser.status
                let address = "addr"
                let name = profileData.f_name + " " + profileData.l_name
                
                let setting = {}

                const superiorUser = await db.user.findOne({
                    where: {
                        uuid: profileData.connectedUser
                    }
                })

                let superior = superiorUser.store

                let countryServices = []

                const countries = await db.country.findAll()
                
                for (let i=0; i<countries.length; i++){
                    
                    let cid = countries[i].uuid
                    let networkdata = []
                    let mobile_recharge = []
                    let voucher = []
                    let utility = []
                    const network = await db.mobile.findAll({
                        where: {
                            countryId: cid
                        }
                    })



                    for (let j=0; j<network.length; j++){
                        const operatorcode = await db.operatorCode.findOne({
                            where: {
                                countryId: cid,
                                mobileId: network[j].uuid
                            }
                        })

                        const settingdata = await db.mobilesetting.findOne({
                            where: {
                                mobileId: network[j].uuid
                            }
                        }).then(data => {
                            if (data){
                                if(data.serviceCode == "MR"){
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
                                            // countries[i].name,
                                            // countries[i].name,
                                            // countries[i].short,
                                            
                                            network[j].name,
                                            network[j].name,
                                            operatorcode.operatorCode,
                                            // settingdata.max_length
                                            (data.max_length).toString(),
                                        ]
                                    }
                                    mobile_recharge.push(settingdat)
                                }else if (data.serviceCode == "UTILITY"){
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
                                            // countries[i].name,
                                            // countries[i].name,
                                            // countries[i].short,
                                            
                                            network[j].name,
                                            network[j].name,
                                            operatorcode.operatorCode,
                                            // settingdata.max_length
                                            (data.max_length).toString(),
                                        ]
                                    }
                                    utility.push(settingdat)
                                }else{
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
                                            // countries[i].name,
                                            // countries[i].name,
                                            // countries[i].short,
                                            
                                            network[j].name,
                                            network[j].name,
                                            operatorcode.operatorCode,
                                            // settingdata.max_length
                                            (data.max_length).toString(),
                                        ]
                                    }
                                    voucher.push(settingdat)
                                }
                                // let settingdat = {
                                //     name: network[j].name,
                                //     group: "recharge",
                                //     category: "mobile",
                                //     type: "operator",
                                //     logo: data.logo,
                                //     service_code: data.serviceCode,
                                //     calling_code: [
                                //         data.callingCode,
                                //     ],
                                //     settings: {
                                //         code: data.serviceCode,
                                //         regex: data.regex,
                                //         max_length: data.max_length,
                                //         data: []
                                //     },
                                //     config: {
                                //         code: data.api_code,
                                //         regex: data.regex,
                                //         denomination_step: data.denominationStep
                                //     },
                                //     country_code: countries[i].short,
                                //     data : [
                                //         // countries[i].name,
                                //         // countries[i].name,
                                //         // countries[i].short,
                                        
                                //         network[j].name,
                                //         network[j].name,
                                //         operatorcode.operatorCode,
                                //         // settingdata.max_length
                                //         (data.max_length).toString(),
                                //     ]
                                // }
                                console.log("Network DATA");
                                // networkdata.push(settingdat);
                                console.log(networkdata);
                            }
                            
                        })  
                        
                    }

                    let grouped_hello_card = {
                        "name":"Hello Card",
                        "group":"cards",
                        "category":"card",
                        "type":"operator",
                        "logo":"HELLO",
                        "service_code":"HELLO",
                        "calling_code":[
                           "971"
                        ],
                        "country_code":"AE",
                        "data":[
                           "9"
                        ]
                    }

                    let grouped_five_card = {
                       "name":"Five Card",
                       "group":"cards",
                       "category":"card",
                       "type":"operator",
                       "logo":"FIVE",
                       "service_code":"FIVE",
                       "calling_code":[
                          "971"
                       ],
                       "country_code":"AE",
                       "data":[
                          "9"
                       ]
                    }

                    let grouped_salik_card = {
                        "name":"Salik Card",
                        "group":"cards",
                        "category":"card",
                        "type":"operator",
                        "logo":"SALIK",
                        "service_code":"SALIK",
                        "calling_code":[
                           "971"
                        ],
                        "country_code":"AE",
                        "data":[
                           "9"
                        ]
                     }

                    let grouped_in = {
                        "name":"India",
                        "group":"recharge",
                        "category":"mobile",
                        "type":"country",
                        "logo":"IN",
                        "settings":{
                           "code":"MR",
                           "regex":"^[0-9]{10}$",
                           "max_length":10,
                           "data":[
                              
                           ]
                        },
                        "regex":"^[0-9]{10}$",
                        "service_code":"MR",
                        "calling_code":[
                           "91"
                        ],
                        "country_code":"IN",
                        "data":[
                           "India",
                           "India",
                           "IN",
                           "10"
                        ]
                    }

                    let grouped_pk = {
                        "name":"Pakistan",
                        "group":"recharge",
                        "category":"mobile",
                        "type":"country",
                        "logo":"PK",
                        "service_code":"MR",
                        "calling_code":[
                           "92"
                        ],
                        "country_code":"PK",
                        "data":[
                           "Pakistan",
                           "Pakistan",
                           "PK",
                           "10"
                        ]
                    }

                    let grouped_bd = {
                        "name":"Bangladesh",
                        "group":"recharge",
                        "category":"mobile",
                        "type":"country",
                        "logo":"BD",
                        "service_code":"MR",
                        "calling_code":[
                           "880"
                        ],
                        "country_code":"BD",
                        "data":[
                           "Bangladesh",
                           "Bangladesh",
                           "BD",
                           "10"
                        ]
                    }

                    let grouped_afghan = {
                        "name":"Afghanistan",
                        "group":"recharge",
                        "category":"mobile",
                        "type":"country",
                        "logo":"AF",
                        "service_code":"MR",
                        "calling_code":[
                           "93"
                        ],
                        "country_code":"AF",
                        "data":[
                           "Afghanistan",
                           "Afghanistan",
                           "AF",
                           "10"
                        ]
                    }
    
                    let grouped_lanka = {
                        "name":"Srilanka",
                        "group":"recharge",
                        "category":"mobile",
                        "type":"country",
                        "logo":"LK",
                        "service_code":"MR",
                        "calling_code":[
                           "94"
                        ],
                        "country_code":"LK",
                        "data":[
                           "Srilanka",
                           "Srilanka",
                           "LK",
                           "10"
                        ]
                    }
    
                    let grouped_nepal = {
                        "name":"Nepal",
                        "group":"recharge",
                        "category":"mobile",
                        "type":"country",
                        "logo":"NP",
                        "service_code":"MR",
                        "calling_code":[
                           "977"
                        ],
                        "country_code":"NP",
                        "data":[
                           "Nepal",
                           "Nepal",
                           "NP",
                           "10"
                        ]
                    }

                    let grouped_int = {
                        "name":"International",
                        "group":"recharge",
                        "category":"international",
                        "type":"international",
                        "logo":"INT",
                        "service_code":"MR",
                        "calling_code":[
                           "00"
                        ],
                        "country_code":"INT",
                        "data":[
                           "International",
                           "International",
                           "mobile",
                           "0"
                        ]
                    }

                    mobile_recharge.push(grouped_in)
                    mobile_recharge.push(grouped_pk)
                    mobile_recharge.push(grouped_bd)
                    mobile_recharge.push(grouped_nepal)
                    mobile_recharge.push(grouped_lanka)
                    mobile_recharge.push(grouped_afghan)
                    // networkdata.push(grouped_five_card)
                    // networkdata.push(grouped_hello_card)
                    // networkdata.push(grouped_int)

                    let countryData = {
                        name: countries[i].name,
                        iso_2: countries[i].short,
                        services: {
                            mobile_recharge: mobile_recharge,
                            utility: utility,
                            voucher: voucher
                        }
                    }
                    countryServices.push(countryData);
                    console.log(countryServices);
                }

                console.log("outside loop country services");
                console.log(countryServices);

                const headerData = {
                    name: "android_settings",
                    chk_status: "chk_running",
                    header: "Sorry",
                    content: "Application is under construction",
                    description: "",
                    highlight: "WILL BE COMPLETED WITHIN 04:30 AM",
                    status: "running",
                    min_app_version: "68",
                    latest_app_version: "76"
                }

                const responseData = {
                    status: status,
                    balance: userbalance,
                    address: address,
                    currency: "United Arab Emirates Dirham",
                    email: email,
                    name: name,
                    contact_no: phone,
                    post: post,
                    credit_limit: "0.000000",
                    reward_enabled: false,
                    superior: superior,
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
                    auth_id: accessToken,
                    refresh_token: refreshToken,
                    user_id: uuid
                }

                logger.info(`${username} has been successfully logged in from device id : ${req.get('device')}`)

                res.setHeader(
                    'service_status', JSON.stringify(headerData)
                )
    
                res.json(responseData);

            }else if(post == "Admin") {
                console.log("ADMIN LOGIN AREA")
                res.json({
                    status: true,
                    name: existingUser.store,
                    phone: existingUser.phone,
                    superior: "self",
                    post: post,
                    credit_limit: "",
                    balance: "",
                    can_add_reseller: true,
                    min_app_version: "68",
                    latest_app_version: "76",
                    server_address: process.env.SERVER_URL,
                    has_token: accessToken,
                    auth_id: accessToken,
                    refresh_token: refreshToken,
                    user_id: existingUser.uuid
                })
            }  

            console.log("BLOCK EXCEEDED")
    })

    authRoute.post('/apphome', async(req, res, next) => {
        console.log("INSIDE APP HOME")

        // CLEAR ALL UUID FROM USER LOGIN
        let user_id = req.body.user_id
        const existingUser = await db.user.findOne({
            where: {
                uuid: user_id
            }
        })

        const userbalance = await recharge.userPortalBalance(existingUser.phone)

        const profileData = await db.userprofile.findOne({
            where: {
                userId: existingUser.uuid
            }
        })

        const deviceData = await db.userdevice.findOne({
            where: {
                userId: existingUser.uuid
            }
        })

        const post = findUserType(existingUser.usertype);

        if(post == "Sales") {
            res.json({
                status: true,
                name: existingUser.store,
                phone: existingUser.phone,
                superior: "admin",
                post: post,
                credit_limit: "0.00000",
                balance: userbalance,
                can_add_reseller: true,
                min_app_version: "68",
                latest_app_version: "76",
                server_address: process.env.SERVER_URL,
                has_token: accessToken,
                auth_id: accessToken,
                refresh_token: refreshToken,
                user_id: existingUser.uuid
                // superior: existingUser.connectedUsesr
            })
        }else if(post == "Sub Reseller") {
            const superiorUser = await db.user.findOne({
                where: {
                    uuid: profileData.connectedUser
                }
            })
            res.json({
                status: true,
                name: existingUser.store,
                phone: existingUser.phone,
                superior: superiorUser.store,
                post: post,
                credit_limit: "0.00000",
                balance: userbalance,
                can_add_customer: true,
                min_app_version: "68",
                latest_app_version: "76",
                server_address: process.env.SERVER_URL,
                user_id: existingUser.uuid
            })
        }else if(post == "Customer") {
            let uid = existingUser.id
            let usertype = existingUser.usertype
            let store = existingUser.store
            let uuid = existingUser.uuid
            let email = existingUser.email
            let phone = existingUser.phone
            let status = existingUser.status
            let address = "addr"
            let name = profileData.f_name + " " + profileData.l_name
            
            let setting = {}

            const superiorUser = await db.user.findOne({
                where: {
                    uuid: profileData.connectedUser
                }
            })

            let superior = superiorUser.store

            let countryServices = []

            const countries = await db.country.findAll()

            console.log(`countries : ${countries}`)
            
            for (let i=0; i<countries.length; i++){
                
                let cid = countries[i].uuid
                let networkdata = []
                let mobile_recharge = []
                let voucher = []
                let utility = []
                const network = await db.mobile.findAll({
                    where: {
                        countryId: cid
                    }
                })



                for (let j=0; j<network.length; j++){
                    const operatorcode = await db.operatorCode.findOne({
                        where: {
                            countryId: cid,
                            mobileId: network[j].uuid
                        }
                    })

                    const settingdata = await db.mobilesetting.findOne({
                        where: {
                            mobileId: network[j].uuid
                        }
                    }).then(data => {
                        if (data){
                            if(data.serviceCode == "MR"){
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
                                        // countries[i].name,
                                        // countries[i].name,
                                        // countries[i].short,
                                        
                                        network[j].name,
                                        network[j].name,
                                        operatorcode.operatorCode,
                                        // settingdata.max_length
                                        (data.max_length).toString(),
                                    ]
                                }
                                mobile_recharge.push(settingdat)
                            }else if (data.serviceCode == "UTILITY"){
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
                                        // countries[i].name,
                                        // countries[i].name,
                                        // countries[i].short,
                                        
                                        network[j].name,
                                        network[j].name,
                                        operatorcode.operatorCode,
                                        // settingdata.max_length
                                        (data.max_length).toString(),
                                    ]
                                }
                                utility.push(settingdat)
                            }else{
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
                                        // countries[i].name,
                                        // countries[i].name,
                                        // countries[i].short,
                                        
                                        network[j].name,
                                        network[j].name,
                                        operatorcode.operatorCode,
                                        // settingdata.max_length
                                        (data.max_length).toString(),
                                    ]
                                }
                                voucher.push(settingdat)
                            }
                            // let settingdat = {
                            //     name: network[j].name,
                            //     group: "recharge",
                            //     category: "mobile",
                            //     type: "operator",
                            //     logo: data.logo,
                            //     service_code: data.serviceCode,
                            //     calling_code: [
                            //         data.callingCode,
                            //     ],
                            //     settings: {
                            //         code: data.serviceCode,
                            //         regex: data.regex,
                            //         max_length: data.max_length,
                            //         data: []
                            //     },
                            //     config: {
                            //         code: data.api_code,
                            //         regex: data.regex,
                            //         denomination_step: data.denominationStep
                            //     },
                            //     country_code: countries[i].short,
                            //     data : [
                            //         // countries[i].name,
                            //         // countries[i].name,
                            //         // countries[i].short,
                                    
                            //         network[j].name,
                            //         network[j].name,
                            //         operatorcode.operatorCode,
                            //         // settingdata.max_length
                            //         (data.max_length).toString(),
                            //     ]
                            // }
                            console.log("Network DATA");
                            // networkdata.push(settingdat);
                            console.log(networkdata);
                        }
                        
                    })  
                    
                }

                let grouped_hello_card = {
                    "name":"Hello Card",
                    "group":"cards",
                    "category":"card",
                    "type":"operator",
                    "logo":"HELLO",
                    "service_code":"HELLO",
                    "calling_code":[
                       "971"
                    ],
                    "country_code":"AE",
                    "data":[
                       "9"
                    ]
                }

                let grouped_five_card = {
                   "name":"Five Card",
                   "group":"cards",
                   "category":"card",
                   "type":"operator",
                   "logo":"FIVE",
                   "service_code":"FIVE",
                   "calling_code":[
                      "971"
                   ],
                   "country_code":"AE",
                   "data":[
                      "9"
                   ]
                }

                let grouped_salik_card = {
                    "name":"Salik Card",
                    "group":"cards",
                    "category":"card",
                    "type":"operator",
                    "logo":"SALIK",
                    "service_code":"SALIK",
                    "calling_code":[
                       "971"
                    ],
                    "country_code":"AE",
                    "data":[
                       "9"
                    ]
                 }

                let grouped_in = {
                    "name":"India",
                    "group":"recharge",
                    "category":"mobile",
                    "type":"country",
                    "logo":"IN",
                    "settings":{
                       "code":"MR",
                       "regex":"^[0-9]{10}$",
                       "max_length":10,
                       "data":[
                          
                       ]
                    },
                    "regex":"^[0-9]{10}$",
                    "service_code":"MR",
                    "calling_code":[
                       "91"
                    ],
                    "country_code":"IN",
                    "data":[
                       "India",
                       "India",
                       "IN",
                       "10"
                    ]
                }

                let grouped_pk = {
                    "name":"Pakistan",
                    "group":"recharge",
                    "category":"mobile",
                    "type":"country",
                    "logo":"PK",
                    "service_code":"MR",
                    "calling_code":[
                       "92"
                    ],
                    "country_code":"PK",
                    "data":[
                       "Pakistan",
                       "Pakistan",
                       "PK",
                       "10"
                    ]
                }

                let grouped_bd = {
                    "name":"Bangladesh",
                    "group":"recharge",
                    "category":"mobile",
                    "type":"country",
                    "logo":"BD",
                    "service_code":"MR",
                    "calling_code":[
                       "880"
                    ],
                    "country_code":"BD",
                    "data":[
                       "Bangladesh",
                       "Bangladesh",
                       "BD",
                       "10"
                    ]
                }

                let grouped_afghan = {
                    "name":"Afghanistan",
                    "group":"recharge",
                    "category":"mobile",
                    "type":"country",
                    "logo":"AF",
                    "service_code":"MR",
                    "calling_code":[
                       "93"
                    ],
                    "country_code":"AF",
                    "data":[
                       "Afghanistan",
                       "Afghanistan",
                       "AF",
                       "10"
                    ]
                }

                let grouped_lanka = {
                    "name":"Srilanka",
                    "group":"recharge",
                    "category":"mobile",
                    "type":"country",
                    "logo":"LK",
                    "service_code":"MR",
                    "calling_code":[
                       "94"
                    ],
                    "country_code":"LK",
                    "data":[
                       "Srilanka",
                       "Srilanka",
                       "LK",
                       "10"
                    ]
                }

                let grouped_nepal = {
                    "name":"Nepal",
                    "group":"recharge",
                    "category":"mobile",
                    "type":"country",
                    "logo":"NP",
                    "service_code":"MR",
                    "calling_code":[
                       "977"
                    ],
                    "country_code":"NP",
                    "data":[
                       "Nepal",
                       "Nepal",
                       "NP",
                       "10"
                    ]
                }

                let grouped_int = {
                    "name":"International",
                    "group":"recharge",
                    "category":"international",
                    "type":"international",
                    "logo":"INT",
                    "service_code":"MR",
                    "calling_code":[
                       "00"
                    ],
                    "country_code":"INT",
                    "data":[
                       "International",
                       "International",
                       "mobile",
                       "0"
                    ]
                }

                mobile_recharge.push(grouped_in)
                mobile_recharge.push(grouped_pk)
                mobile_recharge.push(grouped_bd)
                mobile_recharge.push(grouped_nepal)
                mobile_recharge.push(grouped_lanka)
                mobile_recharge.push(grouped_afghan)
                // networkdata.push(grouped_five_card)
                // networkdata.push(grouped_hello_card)
                // networkdata.push(grouped_int)

                let countryData = {
                    name: countries[i].name,
                    iso_2: countries[i].short,
                    services: {
                        mobile_recharge: mobile_recharge,
                        utility: utility,
                        voucher: voucher
                    }
                }
                countryServices.push(countryData);
                console.log(countryServices);
            }

            console.log("outside loop country services");
            console.log(countryServices);

            const headerData = {
                name: "android_settings",
                chk_status: "chk_running",
                header: "Sorry",
                content: "Application is under construction",
                description: "",
                highlight: "WILL BE COMPLETED WITHIN 04:30 AM",
                status: "running",
                min_app_version: "68",
                latest_app_version: "76"
            }

            const responseData = {
                status: status,
                balance: userbalance,
                address: address,
                currency: "United Arab Emirates Dirham",
                email: email,
                name: name,
                contact_no: phone,
                post: post,
                credit_limit: "0.000000",
                reward_enabled: false,
                superior: superior,
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
                user_id: uuid
            }

            logger.info(`${existingUser.phone} has been successfully logged in from device id : ${req.get('device')}`)

            res.setHeader(
                'service_status', JSON.stringify(headerData)
            )

            res.json(responseData);

        }else if(post == "Admin") {
            console.log("ADMIN LOGIN AREA")
            res.json({
                status: true,
                name: existingUser.store,
                phone: existingUser.phone,
                superior: "self",
                post: post,
                credit_limit: "",
                balance: "",
                can_add_reseller: true,
                min_app_version: "68",
                latest_app_version: "76",
                server_address: process.env.SERVER_URL,
                user_id: existingUser.uuid
            })
        }  

        res.json({
            status: true,
            existingUser,
            userbalance
        })
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

