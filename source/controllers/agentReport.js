import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const uid = 9
const agentReport = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentRecharge = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentDues = async(req, res, next) => {
    let result = []
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            userId: uid,
        },
        include: {
            user: true
        }
    })
    res.status(200).json({
        message: dues
    })
}

const agentSale = async(req, res, next) => {
    let result = []
    const trx = await prisma.transaction.findMany({
        where: {
            userId: uid
        },
        include: {
            doneBy: true,
        }
    })
    res.status(200).json({
        message: trx
    })
}

const agentEarning = async(req, res, next) => {
    let result = []
    const earning = await prisma.agentEarning.findMany({
        where: {
            userId: uid
        },
        include: {
            agent: true,
            trx: true
        }
    })
    res.status(200).json({
        message: earning
    })
}

const agentBalance = async(req, res, next) => {
    // let result = []
    const atrx = await prisma.agentTransaction.findMany(
        {
            where: {
                userId: uid
            },
            include: {
                user: true
            }
        }
    )
    res.status(200).json({
        message: atrx
    })
}

export default {agentReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}