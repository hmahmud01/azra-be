// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const db = require("../models")
const AgentTransaction = db.agenttransaction;
const UserAmountSettlement = db.useramountsettlement;
const AgentEarning = db.agentearning;
const Transaction = db.transaction;

exports.calculateDue = async(username) => {
    const user = await db.user.findOne({
        where:{
            phone: username
        }
    })
    let total = 0;
    let debit = 0;
    let credit = 0;
    const dues = await UserAmountSettlement.findAll({
        where: {
            userId: user.uuid
        }
    })
    
    for(let i=0; i<dues.length; i++){
        debit += dues[i].debit
        credit += dues[i].credit
    }

    total = debit-credit

    console.log("remaing: ", total);
    return {total: total};
}

exports.calculateEarning = async(username) => {
    const user = await db.user.findOne({
        where:{
            phone: username
        }
    })
    let total = 0;
    let result = []
    const earning = await AgentEarning.findAll({
        where: {
            userId: user.uuid
        }
    })

    for(let i=0; i<earning.length; i++){
        total += earning[i].amount
    }
    return {earn: total};
}

exports.calculateSale = async(username) => {
    const user = await db.user.findOne({
        where:{
            phone: username
        }
    })
    let total = 0;
    let result = []
    const trx = await Transaction.findAll({
        where: {
            userId: user.uuid
        }
    })

    for(let i= 0; i<trx.length; i++){
        total+= trx[i].amount
    }
    return {sale: total};
}

exports.calculateBalance = async(username) => {
    const user = await db.user.findOne({
        where:{
            phone: username
        }
    })
    let total = 0;
    let transfer = 0;
    let deduct = 0;
    const atrx = await AgentTransaction.findAll({
        where: {
            userId: user.uuid
        }
    })

    for (let i = 0; i<atrx.length; i++){
        transfer += atrx[i].transferedAmount
        deduct += atrx[i].dedcutedAmount
    }


    total = transfer - deduct


    return {balance: total, received: transfer, transfer: deduct};
}

// export default {calculateDue, calculateEarning, calculateSale, calculateBalance}