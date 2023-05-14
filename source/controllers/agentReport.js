// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// import calculator from './agentReportCalculators.js';

const db = require("../models")
const User = db.user;
const AgentTransaction = db.agenttransaction;
const UserAmountSettlement = db.useramountsettlement;
const AgentEarning = db.agentearning;
const Transaction = db.transaction;
const UserProfile = db.userprofile;
const calculator = require("./agentReportCalculators.js");


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

exports.findAgentReport = async(req, res, next) => {
    let result = [];
    const {page, size, id} = req.query;
    var condition = id ? { id: { [Op.like]: `%${id}%`, usertype: "agent" } } : {usertype: "agent"};

    const {limit, offset} = getPagination(page, size);

    User.findAndCountAll({
        where: condition, limit, offset
    }).then(async data => {
        const response = getPagingData(data, page, limit);

        const agents = response.agents;

        for(let i = 0; i<agents.length; i++){
            const { dueval, saleval, earnval, balanceval } = await calculateAgentData(agents[i].uuid);
            let data = {
                recharge: 0,
                dues: dueval,
                sale: saleval,
                earning: earnval,
                balance: balanceval
            }
            
            agents[i].data = data
    
            let userData = {
                id: agents[i].id,
                uuid: agents[i].uuid,
                email: agents[i].email,
                phone: agents[i].phone,
                store: agents[i].store,
                createdAt: agents[i].createdAt,
                updatedAt: agents[i].updatedAt,
                type: agents[i].usertype,
                status: agents[i].status,
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


exports.agentReport = async(req, res, next) => {

    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    let result = [];
    const agents = await User.findAll({
        where: {
            usertype: "agent"
        },
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

        let userData = {
            id: agents[i].id,
            uuid: agents[i].uuid,
            email: agents[i].email,
            phone: agents[i].phone,
            store: agents[i].store,
            createdAt: agents[i].createdAt,
            updatedAt: agents[i].updatedAt,
            type: agents[i].usertype,
            status: agents[i].status,
            data: data
        }

        result.push(userData);
    }
    console.log(result)

    res.status(200).json({
        message: result
    })
}

exports.agentProfileReport = async(req, res, next) => {
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

    const profile = await UserProfile.findOne({
        where: {
            userId: uid
        },
        // select: {
        //     f_name: true,
        //     l_name: true,
        //     age: true,
        //     email: true,
        //     role: true,
        //     phone: true,
        //     address: true,
        //     connectedUserId: true,
        //     user: {
        //         select: {
        //             store: true,
        //             status: true,
        //             createdAt: true
        //         }
        //     }
        // }
    })

    const subdealer = await User.findOne({
        where: {
            uuid: profile.connectedUserId
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

exports.agentRecharge = async(req, res, next) => {
    const uid = req.params.uid
    let result = []
    res.status(200).json({
        message: result
    })
}

exports.agentDues = async(req, res, next) => {
    const uid = req.params.id
    let due = await calculator.calculateDue(uid);
    const dues = await UserAmountSettlement.findAll({
        where: {
            userId: uid
        }
    })
    res.status(200).json({
        message: dues,
        due: due.total
    })
}

exports.agentSale = async(req, res, next) => {
    const uid = req.params.id
    let sale = await calculator.calculateSale(uid)
    const trx = await Transaction.findAll({
        where: {
            userId: uid
        }
    })
    res.status(200).json({
        message: trx,
        sale: sale.sale
    })
}

exports.agentEarning = async(req, res, next) => {
    const uid = req.params.id
    let earn = await calculator.calculateEarning(uid)
    const earning = await AgentEarning.findAll({
        where: {
            userId: uid
        }
    })
    res.status(200).json({
        message: earning,
        earn: earn.earn
    })
}

exports.agentBalance = async(req, res, next) => {
    const uid = req.params.id
    let balance = await calculator.calculateBalance(uid)
    const atrx = await AgentTransaction.findAll(
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

// export default {agentReport, agentProfileReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}