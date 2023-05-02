// import { hashSync } from "bcrypt";
// import { db } from '../utls/db.js';

const { hashSync } = require("bcrypt");
const db = require("../../models");
const User = db.user
const UserProfile = db.userprofile
const AgentTransaction = db.agenttransaction
const AgentPercentage = db.agentpercentage

function findUserByEmail(email){
    return User.findOne({
        where: {
            email,
        }
    })
}

function findUserByPhone(phone){
    return User.findOne({
        where: {
            phone
        }
    })
}

async function createSuperUser(user){

    const data = {
        email: user.email,
        phone: user.phone,
        password: hashSync(user.password, 12),
        userType: user.type,
        status: true
    }

    console.log(data)
    const dbuser = await User.create(data)

    return dbuser;
}

async function createUserByEmailAndPassword(user){
    const data = {
        email: user.email,
        store: user.store,
        phone: user.phone,
        password: hashSync(user.password, 12),
        usertype: user.type,
        status: true
    }


    console.log("user value : ",user);
    const dbuser = await User.create(data)

    console.log(dbuser)

    const profile = await UserProfile.create({
        f_name: user.fname,
        l_name: user.lname,
        age: parseInt(user.age),
        email: user.email,
        role: user.type,
        phone: user.phone,
        address: user.address,
        userId: dbuser.uuid,
        connectedUserId: user.ref
    })

    const trx = {
        userId: dbuser.uuid,
        transferedAmount: 0.00,
        dedcutedAmount: 0.00,
        note: "New Account TRX"
    }

    console.log(trx);

    const agentTrx = await AgentTransaction.create(trx)

    const openingPercent = {
        userId: dbuser.uuid,
        percentage: 0.10
    }

    const agentPercent = await AgentPercentage.create(openingPercent)

    console.log(`first trx from ${dbuser.id}`, agentTrx, agentPercent);

    return dbuser;
}

function findUserById(id){
    return User.findOne({
        where: {
            id,
        }
    })
}

module.exports = {
    findUserByEmail,
    findUserByPhone,
    createSuperUser,
    findUserById,
    createUserByEmailAndPassword
}