// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// import calculator from './agentReportCalculators.js';

const db = require("../models");
const calculator = require('./agentReportCalculators.js');

exports.dealer = async(req, res, next) => {
    // let result = []
    const dealers = await db.user.findAll({
        where: {
            type: "dealer"
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

    res.status(200).json({
        message: dealers
    })
}

exports.dealerSubDealerReport = async(req, res, next) => {
    const uid = req.params.uid
    console.log(uid);

    const user = await db.user.findOne({
        where: {
            uuid: uid
        }
    })

    const subdealers = await db.userprofile.findAll({
        where: {
            connectedUserId: uid
        },
        // select:{
        //     id: true, 
        //     uuid: true, 
        //     f_name: true, 
        //     l_name: true, 
        //     age: true, 
        //     email: true, 
        //     role: true, 
        //     phone: true, 
        //     address: true,
        //     userId: true,
        //     user: {
        //         select:{
        //             id: true,
        //             uuid: true,
        //             email: true,
        //             phone: true,
        //             store: true,
        //             createdAt: true,
        //             updatedAt: true,
        //             type: true,
        //             status: true
        //         }
        //     }
        // }
    })

    console.log(subdealers);


    console.log("Subdealer Dealer REport")
    res.status(200).json({
        message: subdealers
    })
}

exports.dealersubDealerAgentReport = async(req, res, next) => {
    const uid = req.params.uid
    console.log("uid", uid);
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0

    const user = await db.user.findOne({
        where: {
            uuid: uid
        }
    })

    console.log(user);

    const agents = await db.userprofile.findAll({
        where: {
            connectedUserId: uid
        },
        // select:{
        //     id: true, 
        //     uuid: true, 
        //     f_name: true, 
        //     l_name: true, 
        //     age: true, 
        //     email: true, 
        //     role: true, 
        //     phone: true, 
        //     address: true,
        //     userId: true,
        //     user: {
        //         select:{
        //             id: true,
        //             uuid: true,
        //             email: true,
        //             phone: true,
        //             store: true,
        //             createdAt: true,
        //             updatedAt: true,
        //             type: true,
        //             status: true
        //         }
        //     }
        // }
    })

    console.log(agents);
    for(let i = 0; i<agents.length; i++){
        await calculator.calculateDue(agents[i].user.uuid).then(res => {dueval = res.total});
        await calculator.calculateSale(agents[i].user.uuid).then(res => {saleval = res.sale});
        await calculator.calculateEarning(agents[i].user.uuid).then(res => {earnval = res.earn});
        await calculator.calculateBalance(agents[i].user.uuid).then(res => {balanceval = res.balance});
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

// export default { dealer, dealerSubDealerReport, dealersubDealerAgentReport }