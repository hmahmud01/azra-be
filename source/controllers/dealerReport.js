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
    })

    console.log(subdealers);


    console.log("Subdealer Dealer REport")
    res.status(200).json({
        message: subdealers
    })
}

const getPagination = (page, size) => {
    const limit = size? +size : 3;
    const offset = page ? page * limit : 0;

    return {limit, offset};
}

const getPagingData = (data, page, limit) => {
    const {count: totalItems, rows: agents} = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems/limit);
    return { totalItems, agents, totalPages, currentPage };
}

const calculateAgentData = async(uuid) => {
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    await calculator.calculateDue(uuid).then(res => {dueval = res.total});
    await calculator.calculateSale(uuid).then(res => {saleval = res.sale});
    await calculator.calculateEarning(uuid).then(res => {earnval = res.earn});
    await calculator.calculateBalance(uuid).then(res => {balanceval = res.balance});
    return { dueval, saleval, earnval, balanceval };
}


exports.dealersubDealerAgentReportPaginated = async(req, res, next) => {
    let result = [];
    const uid = req.params.uid;
    const {page, size, id} = req.query;
    var condition = {
        connectedUser: uid
    }

    const { limit, offset } = getPagination(page, size);

    await db.userprofile.findAndCountAll({
        where: condition, limit, offset
    }).then(async data => {
        const response = getPagingData(data, page, limit);
        const agents = response.agents;

        for (let i = 0; i<agents.length; i++){
            const { dueval, saleval, earnval, balanceval } = await calculateAgentData(agents[i].uuid);
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
        response.agents = result

        res.send(response);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "SOME ERROR"
        })
    })
}


exports.dealersubDealerAgentReport = async(req, res, next) => {
    const uid = req.params.uid
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    let result = []


    const agents = await db.userprofile.findAll({
        where: {
            connectedUser: uid
        },
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