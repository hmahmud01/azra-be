import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import calculator from './agentReportCalculators.js';

const agentReport = async(req, res, next) => {
    let result = []
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    const agents = await prisma.user.findMany({
        where: {
            type: "agent"
        }
    })

    for(let i = 0; i<agents.length; i++){
        let dues = await calculator.calculateDue(agents[i].id).then(res => {dueval = res.total});
        let sale = await calculator.calculateSale(agents[i].id).then(res => {saleval = res.sale});
        let eraning = await calculator.calculateEarning(agents[i].id).then(res => {earnval = res.earn});
        let balance = await calculator.calculateBalance(agents[i].id).then(res => {balanceval = res.balance});
        let data = {
            recharge: 0,
            dues: dueval,
            sale: saleval,
            earning: earnval,
            balance: balanceval
        }

        let agentdata = {
            id: agents[i].id,
            uuid: agents[i].uuid,
            email: agents[i].email,
            phone: agents[i].phone,
            store: agents[i].store,
            createdAt: agents[i].createdAt,
            updatedAt: agents[i].updatedAt,
            type: agents[i].type,
            status: agents[i].status,
            data: data
        }

        result.push(agentdata)
    }

    res.status(200).json({
        message: result
    })
}

const agentRecharge = async(req, res, next) => {
    const uid = parseInt(req.params.uid)
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentDues = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
    let due = await calculator.calculateDue(uid);
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            userId: uid,
        }
    })
    res.status(200).json({
        message: dues,
        due: due.total
    })
}

const agentSale = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
    let sale = await calculator.calculateSale(uid)
    const trx = await prisma.transaction.findMany({
        where: {
            userId: uid
        }
    })
    res.status(200).json({
        message: trx,
        sale: sale.sale
    })
}

const agentEarning = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
    let earn = await calculator.calculateEarning(uid)
    const earning = await prisma.agentEarning.findMany({
        where: {
            userId: uid
        },
        include: {
            trx: true
        }
    })
    res.status(200).json({
        message: earning,
        earn: earn.earn
    })
}

const agentBalance = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let balance = await calculator.calculateBalance(uid)
    const atrx = await prisma.agentTransaction.findMany(
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

export default {agentReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}