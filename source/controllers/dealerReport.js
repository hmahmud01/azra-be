import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import calculator from './agentReportCalculators.js';

const dealer = async(req, res, next) => {
    const dealers = await prisma.user.findMany({
        where: {
            type: "dealer"
        }
    })

    res.status(200).json({
        message: dealers
    })
}

const dealerSubDealerReport = async(req, res, next) => {
    const uid = parseInt(req.params.uid)
    console.log(uid);

    const subdealers = await prisma.userProfile.findMany({
        where: {
            connectedUserId: uid
        },
        include: {
            user: true
        }
    })

    console.log(subdealers);


    console.log("Subdealer Dealer REport")
    res.status(200).json({
        message: subdealers
    })
}

const dealersubDealerAgentReport = async(req, res, next) => {
    const uid = parseInt(req.params.uid)
    console.log(uid);
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0

    const agents = await prisma.userProfile.findMany({
        where: {
            connectedUserId: uid
        },
        include: {
            user: true
        }
    })
    for(let i = 0; i<agents.length; i++){
        let dues = await calculator.calculateDue(agents[i].user.id).then(res => {dueval = res.total});
        let sale = await calculator.calculateSale(agents[i].user.id).then(res => {saleval = res.sale});
        let eraning = await calculator.calculateEarning(agents[i].user.id).then(res => {earnval = res.earn});
        let balance = await calculator.calculateBalance(agents[i].user.id).then(res => {balanceval = res.balance});
        let data = {
            recharge: 0,
            dues: dueval,
            sale: saleval,
            earning: earnval,
            balance: balanceval
        }

        agents[i].data = data;
    }

    console.log("agent for subd")
    res.status(200).json({
        message: agents
    })  
}

export default { dealer, dealerSubDealerReport, dealersubDealerAgentReport }