// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// import calculator from './agentReportCalculators.js';

const db = require("../models");
const calculator = require('./agentReportCalculators.js');

exports.dealer = async(req, res, next) => {
    // let result = []
    const dealers = await db.user.findAll({
        where: {
            usertype: "dealer"
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
            connectedUser: uid
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
    let result = []

    // const user = await db.user.findOne({
    //     where: {
    //         uuid: uid
    //     }
    // })

    // console.log(user);

    const agents = await db.userprofile.findAll({
        where: {
            connectedUser: uid
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
        await calculator.calculateDue(agents[i].userId).then(res => {dueval = res.total});
        await calculator.calculateSale(agents[i].userId).then(res => {saleval = res.sale});
        await calculator.calculateEarning(agents[i].userId).then(res => {earnval = res.earn});
        await calculator.calculateBalance(agents[i].userId).then(res => {balanceval = res.balance});
        let data = {
            recharge: 0,
            dues: dueval,
            sale: saleval,
            earning: earnval,
            balance: balanceval
        }

        agents[i].data = data;

        const user = await db.user.findOne({
            where: {
                uuid: agents[i].userId
            }
        })

        let userData = {
            id: agents[i].id,
            uuid: agents[i].userId,
            email: agents[i].email,
            phone: agents[i].phone,
            store: user.store,
            createdAt: agents[i].createdAt,
            updatedAt: agents[i].updatedAt,
            type: agents[i].role,
            status: user.status,
            data: data
        }

        result.push(userData);
    }

    console.log("agent for subd")
    console.log(result)
    res.status(200).json({
        message: result
    })  
}

// export default { dealer, dealerSubDealerReport, dealersubDealerAgentReport }