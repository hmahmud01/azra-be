// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const db = require("../models");
const { Op } = require('sequelize')

exports.orgReport = async(req, res, next) => {
    let earned = 0;
    let success_recharge_count = 0;
    let failed_recharge_count = 0;
    let total_sales = 0;
    let refunded_profit = 0;
    let refund_sales = 0;
    let earned_record = []
    let result = await db.organizationearned.findAll();

    const refunds = await db.transactionadjusments.findAll()

    for(let i=0; i<refunds.length; i++){
        const trx = await db.transaction.findOne({
            where: {
                uuid: refunds[i].transactionId
            }
        })
        refunded_profit += refunds[i].adjusted_profit
        refund_sales += trx.amount
    }
    for(let i = 0; i<result.length; i++){
        const trx = await db.transaction.findOne({
            where: {
                uuid: result[i].transactionId
            }
        })
        const api = await db.api.findOne({
            where: {
                uuid: result[i].apiId
            }
        })
        let data = {
            id: result[i].id,
            transactionId: result[i].transactionId,
            trxuuid: result[i].transactionId,
            rechargeAmount: trx.amount,
            apiId: result[i].apiId,
            api: api.name,
            cutAmount: result[i].cutAmount,
            status: trx.rechargeStatus,
            createdAt: result[i].createdAt
        }
        earned_record.push(data);
        earned += result[i].cutAmount
    }

    let trx = await db.transaction.findAll()

    for (let i=0; i<trx.length; i++){
        if(trx[i].rechargeStatus == true){
            success_recharge_count++;
            total_sales += trx[i].amount
        }else if(trx[i].rechargeStatus == false){
            failed_recharge_count++;
        }
    }

    let sendData = earned_record.reverse();

    let profit_adjustment = earned - refunded_profit
    let sales_adjustment = total_sales - refund_sales

    const date = new Date();
    const month = date.getMonth() + 1
    const prevDay = date.getDate() -1
    const nextDay = date.getDate() +1
    const yesterDay = new Date(`${date.getFullYear()}-${month}-${prevDay}`);
    const tomorrow = new Date(`${date.getFullYear()}-${month}-${nextDay}`);

    let today_earned_records = await db.organizationearned.findAll({
        where: {
            createdAt: {
                [Op.lte]: tomorrow,
                [Op.gte]: yesterDay
            }
        }
    });

    let today_earned = 0;
    let today_success_count = 0;
    let today_sales = 0;

    for (let i = 0; i<today_earned_records.length; i++){
        const trx = await db.transaction.findOne({
            where: {
                uuid: today_earned_records[i].transactionId
            }
        })
        if (trx.rechargeStatus == true){
            today_success_count++
            today_sales += trx.amount 
            today_earned += today_earned_records[i].cutAmount
        }
    }

    let main_earning = earned - refunded_profit
    res.status(200).json({
        main_earning: main_earning,
        message: sendData,
        total_earned: earned,
        success_recharge_count: success_recharge_count,
        failed_recharge_count: failed_recharge_count,
        total_sales: total_sales,
        refunds: refunded_profit,
        refund_sales: refund_sales,
        adjustment: {
            profit: profit_adjustment,
            sales: sales_adjustment
        },
        today_earned: today_earned,
        today_success_count: today_success_count,
        today_sales: today_sales
    })
}

exports.allTransactions = async(req, res, next) => {
    let result = await db.transaction.findAll();

    let trx = []

    for (let i = 0; i<result.length; i++){
        const doneBy = await db.user.findOne({where: {uuid: result[i].userId}})
        const country = await db.country.findOne({where: {uuid: result[i].countryId}})
        const mobile = await db.mobile.findOne({where: {uuid: result[i].mobileId}})
        const service = await db.service.findOne({where: {uuid: result[i].serviceId}})

        let data = {
            trxId: result[i].id,
            uuid: result[i].uuid,
            phone: result[i].phone,
            amount: result[i].amount,
            rechargeStatus: result[i].rechargeStatus,
            doneBy: doneBy.email,
            store: doneBy.store,
            country: country.name,
            network: mobile.name,
            service: service.name,
            createdAt: result[i].createdAt
        }
        trx.push(data);
    }

    res.status(200).json({
        message: trx
    })
}

exports.trxDetail = async(req, res, next) => {
    const tid = req.params.id
    let result = await db.transaction.findOne({
        where: {
            uuid: tid
        }
    })

    const doneBy = await db.user.findOne({where: {uuid: result.userId}})
    const country = await db.country.findOne({where: {uuid: result.countryId}})
    const mobile = await db.mobile.findOne({where: {uuid: result.mobileId}})
    const service = await db.service.findOne({where: {uuid: result.serviceId}})

    const orgEarned = await db.organizationearned.findOne({
        where: {
            transactionId: tid
        }
    })

    const agentEarned = await db.agentearning.findOne({
        where: {
            trxId: tid
        }
    })

    const source = await db.transactionsource.findOne({
        where: {
            transactionId: tid
        }
    })

    const trxResponse = await db.transactionresponse.findOne({
        where: {
            transactionId: tid
        }
    })

    let trx_resp = ""
    let trx_stat = null

    if(trxResponse != null){
        trx_resp = trxResponse.response
        trx_stat = trxResponse.status
    }

    let trx = {
        id: result.id,
        phone: result.phone,
        amount: result.amount,
        status: result.rechargeStatus,
        agent_email: doneBy.email,
        agent_phone: doneBy.phone,
        store: doneBy.store,
        ctry: country.name,
        mno: mobile.name,
        service: service.name,
        device: source.device,
        ip_addr: source.ip_addr,
        trx_resp: trx_resp,
        trx_stat: trx_stat,
        agentCut: agentEarned.amount,
        orgCut: orgEarned.cutAmount
    }

    console.log("trx : ", trx)

    res.status(200).json({
        message : trx
    })
}

exports.filterTrx = async(req, res, next) => {
    const data = req.body

    let earned = 0;
    let success_recharge_count = 0;
    let failed_recharge_count = 0;
    let total_sales = 0;
    let earned_record = []

    console.log("time data : ", data)

    let result = await db.organizationearned.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(data.end_date),
                [Op.gte]: new Date(data.start_date)
            }
        }
    });

    const refunds = await db.transactionadjusments.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(data.end_date),
                [Op.gte]: new Date(data.start_date)
            }
        }
    })

    for(let i=0; i<refunds.length; i++){
        const trx = await db.transaction.findOne({
            where: {
                uuid: refunds[i].transactionId
            }
        })
        refunded_profit += refunds[i].adjusted_profit
        refund_sales += trx.amount
    }

    for(let i = 0; i<result.length; i++){
        const trx = await db.transaction.findOne({
            where: {
                uuid: result[i].transactionId
            }
        })
        const api = await db.api.findOne({
            where: {
                uuid: result[i].apiId
            }
        })
        let data = {
            id: result[i].id,
            transactionId: result[i].transactionId,
            rechargeAmount: trx.amount,
            apiId: result[i].apiId,
            api: api.name,
            cutAmount: result[i].cutAmount,
            createdAt: result[i].createdAt,
        }
        earned_record.push(data);
        earned += result[i].cutAmount
    }

    let trx = await db.transaction.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(data.end_date),
                [Op.gte]: new Date(data.start_date)
            }
        }
    })

    for (let i=0; i<trx.length; i++){
        if(trx[i].rechargeStatus == true){
            success_recharge_count++;
            total_sales += trx[i].amount
        }else if(trx[i].rechargeStatus == false){
            failed_recharge_count++;
        }
    }

    res.status(200).json({
        message: earned_record,
        total_earned: earned,
        success_recharge_count: success_recharge_count,
        failed_recharge_count: failed_recharge_count,
        total_sales: total_sales,
        main_earning: 0,
        today_earned: 0,
        today_success_count: 0,
        today_sales: 0
    })   
}

exports.allAdjusmtments = async(req, res, next) => {
    const data = []
    const adjustments = await db.transactionadjusments.findAll();

    for (let i=0; i<adjustments.length; i++){
        const trx = await db.transaction.findOne({
            where: {
                uuid: adjustments[i].transactionId
            }
        })
        let val = {
            id: adjustments[i].id,
            adjusted_profit: adjustments[i].adjusted_profit,
            refund_note: adjustments[i].refund_note,
            created_at: adjustments[i].createdAt,
            trxId: adjustments[i].transactionId,
            phone: trx.phone,
            amount: trx.amount,
            agent: trx.agent 
        }
        data.push(val);
    }

    res.status(200).json({
        message: data
    })
}

exports.systemLog = async(req, res, next) => {
    const result = await db.systemlog.findAll();

    res.status(200).json({
        message: result
    })
}
