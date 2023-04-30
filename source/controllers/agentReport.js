// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// import calculator from './agentReportCalculators.js';

const db = require("../models")
const User = db.user;
const AgentTransaction = db.agenttransaction;
const UserAmountSettlement = db.useramountsettlement;
const AgentEarning = db.agentearning;
const Transaction = db.transaction;
const UserProfile = db.userprofile;
const calculator = require("./agentReportCalculators.js");

exports.agentReport = async(req, res, next) => {
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    const agents = await User.findAll({
        where: {
            type: "agent"
        },
        // select:{
        //     id: true,
        //     uuid: true,
        //     email: true,
        //     phone: true,
        //     store: true,
        //     createdAt: true,
        //     updatedAt: true,
        //     type: true,
        //     status: true
        // }
    })

    for(let i = 0; i<agents.length; i++){
        await calculator.calculateDue(agents[i].uuid).then(res => {dueval = res.total});
        await calculator.calculateSale(agents[i].uuid).then(res => {saleval = res.sale});
        await calculator.calculateEarning(agents[i].uuid).then(res => {earnval = res.earn});
        await calculator.calculateBalance(agents[i].uuid).then(res => {balanceval = res.balance});
        let data = {
            recharge: 0,
            dues: dueval,
            sale: saleval,
            earning: earnval,
            balance: balanceval
        }
        
        agents[i].data = data
    }

    res.status(200).json({
        message: agents
    })
}

exports.agentProfileReport = async(req, res, next) => {
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    const uid = req.params.id

    await calculator.calculateDue(uid).then(res => {dueval = res.total});
    await calculator.calculateSale(uid).then(res => {saleval = res.sale});
    await calculator.calculateEarning(uid).then(res => {earnval = res.earn});
    await calculator.calculateBalance(uid).then(res => {balanceval = res.balance});

    const finance = {
        due: dueval,
        sale: saleval,
        earn: earnval,
        balance: balanceval
    }

    const profile = await UserProfile.findOne({
        where: {
            userId: uid
        },
        // select: {
        //     f_name: true,
        //     l_name: true,
        //     age: true,
        //     email: true,
        //     role: true,
        //     phone: true,
        //     address: true,
        //     connectedUserId: true,
        //     user: {
        //         select: {
        //             store: true,
        //             status: true,
        //             createdAt: true
        //         }
        //     }
        // }
    })

    const subdealer = await User.findOne({
        where: {
            uuid: profile.connectedUserId
        }
    })
    profile.store = profile.user.store
    profile.createdAt = profile.user.createdAt

    profile.subdealer_phone = subdealer.phone
    profile.subdealer_store = subdealer.store

    res.status(200).json({
        message: {
            finance: finance,
            profile: profile
        }
    })

}

exports.agentRecharge = async(req, res, next) => {
    const uid = req.params.uid
    let result = []
    res.status(200).json({
        message: result
    })
}

exports.agentDues = async(req, res, next) => {
    const uid = req.params.id
    let due = await calculator.calculateDue(uid);
    const dues = await UserAmountSettlement.findAll({
        where: {
            userId: uid
        }
    })
    res.status(200).json({
        message: dues,
        due: due.total
    })
}

exports.agentSale = async(req, res, next) => {
    const uid = req.params.id
    let sale = await calculator.calculateSale(uid)
    const trx = await Transaction.findAll({
        where: {
            userId: uid
        }
    })
    res.status(200).json({
        message: trx,
        sale: sale.sale
    })
}

exports.agentEarning = async(req, res, next) => {
    const uid = req.params.id
    let earn = await calculator.calculateEarning(uid)
    const earning = await AgentEarning.findAll({
        where: {
            userId: uid
        }
    })
    res.status(200).json({
        message: earning,
        earn: earn.earn
    })
}

exports.agentBalance = async(req, res, next) => {
    const uid = req.params.id
    let balance = await calculator.calculateBalance(uid)
    const atrx = await AgentTransaction.findAll(
        {
            where: {
                userId: uid
            }
        }
    )

    console.log(atrx);
    res.status(200).json({
        message: atrx,
        balance: balance.balance
    })
}

// export default {agentReport, agentProfileReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}