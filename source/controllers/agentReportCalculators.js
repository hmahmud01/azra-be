import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const calculateDue = async(id) => {
    let total = 0;
    let debit = 0;
    let credit = 0;
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            userId: id,
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

const calculateEarning = async(id) => {
    let total = 0;
    let result = []
    const earning = await prisma.agentEarning.findMany({
        where: {
            userId: id
        }
    })

    for(let i=0; i<earning.length; i++){
        total += earning[i].amount
    }
    return {earn: total};
}

const calculateSale = async(id) => {
    let total = 0;
    let result = []
    const trx = await prisma.transaction.findMany({
        where: {
            userId: id
        }
    })

    for(let i= 0; i<trx.length; i++){
        total+= trx[i].amount
    }
    return {sale: total};
}

const calculateBalance = async(id) => {
    let total = 0;
    let transfer = 0;
    let deduct = 0;
    const atrx = await prisma.agentTransaction.findMany({
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

export default {calculateDue, calculateEarning, calculateSale, calculateBalance}