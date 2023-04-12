import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import calculator from './agentReportCalculators.js';

const agentReport = async(req, res, next) => {
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    const agents = await prisma.user.findMany({
        where: {
            type: "agent"
        },
        select:{
            id: true,
            uuid: true,
            email: true,
            phone: true,
            store: true,
            createdAt: true,
            updatedAt: true,
            type: true,
            status: true
        }
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

const agentProfileReport = async(req, res, next) => {
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

    const profile = await prisma.userProfile.findFirst({
        where: {
            user: {
                is: {
                    uuid: uid
                }
            }
        },
        select: {
            f_name: true,
            l_name: true,
            age: true,
            email: true,
            role: true,
            phone: true,
            address: true,
            connectedUserId: true,
            user: {
                select: {
                    store: true,
                    status: true,
                    createdAt: true
                }
            }
        }
    })

    const subdealer = await prisma.user.findFirst({
        where: {
            id: profile.connectedUserId
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

const agentRecharge = async(req, res, next) => {
    const uid = req.params.uid
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentDues = async(req, res, next) => {
    const uid = req.params.id
    let due = await calculator.calculateDue(uid);
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            user: {
                is: {
                    uuid: uid
                }
            }
        }
    })
    res.status(200).json({
        message: dues,
        due: due.total
    })
}

const agentSale = async(req, res, next) => {
    const uid = req.params.id
    let sale = await calculator.calculateSale(uid)
    const trx = await prisma.transaction.findMany({
        where: {
            doneBy: {
                is: {
                    uuid: uid
                }
            }
        }
    })
    res.status(200).json({
        message: trx,
        sale: sale.sale
    })
}

const agentEarning = async(req, res, next) => {
    const uid = req.params.id
    let earn = await calculator.calculateEarning(uid)
    const earning = await prisma.agentEarning.findMany({
        where: {
            agent: {
                is: {
                    uuid: uid
                }
            }
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
    const uid = req.params.id
    let balance = await calculator.calculateBalance(uid)
    const atrx = await prisma.agentTransaction.findMany(
        {
            where: {
                user: {
                    is: {
                        uuid: uid
                    }
                }
            }
        }
    )

    console.log(atrx);
    res.status(200).json({
        message: atrx,
        balance: balance.balance
    })
}

export default {agentReport, agentProfileReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}