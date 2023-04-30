// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const db = require("../models")
const AgentTransaction = db.agenttransaction;
const UserAmountSettlement = db.useramountsettlement;
const AgentEarning = db.agentearning;
const Transaction = db.transaction;

exports.calculateDue = async(id) => {
    let total = 0;
    let debit = 0;
    let credit = 0;
    const dues = await UserAmountSettlement.findAll({
        where: {
            userId: id
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

exports.calculateEarning = async(id) => {
    let total = 0;
    let result = []
    const earning = await AgentEarning.findAll({
        where: {
            userId: id
        }
    })

    for(let i=0; i<earning.length; i++){
        total += earning[i].amount
    }
    return {earn: total};
}

exports.calculateSale = async(id) => {
    let total = 0;
    let result = []
    const trx = await Transaction.findAll({
        where: {
            userId: id
        }
    })

    for(let i= 0; i<trx.length; i++){
        total+= trx[i].amount
    }
    return {sale: total};
}

exports.calculateBalance = async(id) => {
    let total = 0;
    let transfer = 0;
    let deduct = 0;
    const atrx = await AgentTransaction.findAll({
        where: {
            userId: id
        }
    })

    for (let i = 0; i<atrx.length; i++){
        transfer += atrx[i].transferedAmount
        deduct += atrx[i].deductedAmount
    }

    total = transfer - deduct

    return {balance: total};
}

// export default {calculateDue, calculateEarning, calculateSale, calculateBalance}