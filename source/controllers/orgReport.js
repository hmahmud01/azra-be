import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const orgReport = async(req, res, next) => {
    let earned = 0;
    let success_recharge_count = 0;
    let failed_recharge_count = 0;
    let total_sales = 0;
    let refunded_profit = 0;
    let refund_sales = 0;
    let earned_record = []
    let result = await prisma.organizationEarned.findMany({
        include: {
            trx: true,
            api: true
        }
    });

    const refunds = await prisma.transactionAdjustments.findMany({
        include: {
            trx: true
        }
    })

    for(let i=0; i<refunds.length; i++){
        refunded_profit += refunds[i].adjusted_profit
        refund_sales += refunds[i].trx.amount
    }
    for(let i = 0; i<result.length; i++){
        let data = {
            id: result[i].id,
            transactionId: result[i].transactionId,
            trxuuid: result[i].trx.uuid,
            rechargeAmount: result[i].trx.amount,
            apiId: result[i].apiId,
            api: result[i].api.name,
            cutAmount: result[i].cutAmount,
            createdAt: result[i].createdAt
        }
        earned_record.push(data);
        earned += result[i].cutAmount
    }

    let trx = await prisma.transaction.findMany({})

    for (let i=0; i<trx.length; i++){
        if(trx[i].rechargeStatus == true){
            success_recharge_count++;
            total_sales += trx[i].amount
        }else if(trx[i].rechargeStatus == false){
            failed_recharge_count++;
        }
    }

    let profit_adjustment = earned - refunded_profit
    let sales_adjustment = total_sales - refund_sales

    res.status(200).json({
        message: earned_record,
        total_earned: earned,
        success_recharge_count: success_recharge_count,
        failed_recharge_count: failed_recharge_count,
        total_sales: total_sales,
        refunds: refunded_profit,
        refund_sales: refund_sales,
        adjustment: {
            profit: profit_adjustment,
            sales: sales_adjustment
        }
    })
}

const allTransactions = async(req, res, next) => {
    let result = await prisma.transaction.findMany({
        include:{
            doneBy: true,
            country: true,
            mobile: true,
            service: true
        }
    });


    // OPTIMIZED QUERY - WORKING ON
    let result2 = await prisma.transaction.findMany({
        select: {
            id: true,
            uuid: true,
            phone: true,
            amount: true,
            rechargeStatus: true,
            doneBy: {
                select: {
                    email: true,
                    store: true,
                }
            },
            country: {
                select: {
                    name: true
                }
            },
            mobile: {
                select: {
                    name: true
                }
            },
            service: {
                select: {
                    name: true
                }
            },
            createdAt: true
        }
    })

    let trx = []

    for (let i = 0; i<result.length; i++){
        let data = {
            trxId: result[i].id,
            uuid: result[i].uuid,
            phone: result[i].phone,
            amount: result[i].amount,
            rechargeStatus: result[i].rechargeStatus,
            doneBy: result[i].doneBy.email,
            store: result[i].doneBy.store,
            country: result[i].country.name,
            network: result[i].mobile.name,
            service: result[i].service.name,
            createdAt: result[i].createdAt
        }
        trx.push(data);
    }

    res.status(200).json({
        message: trx
    })
}

const trxDetail = async(req, res, next) => {
    const tid = req.params.id
    let result = await prisma.transaction.findFirst({
        where: {
            uuid: tid
        },
        include:{
            doneBy: true,
            country: true,
            mobile: true,
            service: true
        }
    })

    const source = await prisma.transactionSource.findFirst({
        where: {
            trx: {
                is: {
                    uuid: tid
                }
            }
        }
    })

    const trxResponse = await prisma.transactionResponse.findFirst({
        where: {
            trx: {
                is: {
                    uuid: tid
                }
            }
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
        agent_email: result.doneBy.email,
        agent_phone: result.doneBy.phone,
        store: result.doneBy.store,
        ctry: result.country.name,
        mno: result.mobile.name,
        service: result.service.name,
        device: source.device,
        ip_addr: source.ip_addr,
        trx_resp: trx_resp,
        trx_stat: trx_stat
    }

    console.log("trx : ", trx)

    res.status(200).json({
        message : trx
    })
}

const filterTrx = async(req, res, next) => {
    const data = req.body

    let earned = 0;
    let success_recharge_count = 0;
    let failed_recharge_count = 0;
    let total_sales = 0;
    let earned_record = []

    console.log("time data : ", data)

    let result = await prisma.organizationEarned.findMany({
        where: {
            createdAt: {
                lte: new Date(data.end_date),
                gte: new Date(data.start_date)
            }
        },
        include: {
            trx: true,
            api: true
        }
    });

    const refunds = await prisma.transactionAdjustments.findMany({
        where: {
            createdAt: {
                lte: new Date(data.end_date),
                gte: new Date(data.start_date)
            }
        },
        include: {
            trx: true
        }
    })

    for(let i=0; i<refunds.length; i++){
        refunded_profit += refunds[i].adjusted_profit
        refund_sales += refunds[i].trx.amount
    }

    for(let i = 0; i<result.length; i++){
        let data = {
            id: result[i].id,
            transactionId: result[i].transactionId,
            rechargeAmount: result[i].trx.amount,
            apiId: result[i].apiId,
            api: result[i].api.name,
            cutAmount: result[i].cutAmount,
            createdAt: result[i].createdAt
        }
        earned_record.push(data);
        earned += result[i].cutAmount
    }

    let trx = await prisma.transaction.findMany({
        where: {
            createdAt: {
                lte: new Date(data.end_date),
                gte: new Date(data.start_date)
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
        total_sales: total_sales
    })   
}

const allAdjusmtments = async(req, res, next) => {
    const data = []
    const adjustments = await prisma.transactionAdjustments.findMany({
        include: {
            trx: true
        }
    });

    for (let i=0; i<adjustments.length; i++){
        let val = {
            id: adjustments[i].id,
            adjusted_profit: adjustments[i].adjusted_profit,
            refund_note: adjustments[i].refund_note,
            created_at: adjustments[i].createdAt,
            trxId: adjustments[i].transactionId,
            phone: adjustments[i].trx.phone,
            amount: adjustments[i].trx.amount,
            agent: adjustments[i].trx.agent 
        }

        data.push(val);
    }

    res.status(200).json({
        message: data
    })
}

const systemLog = async(req, res, next) => {
    const result = await prisma.systemLog.findMany();

    res.status(200).json({
        message: result
    })
}


export default {orgReport, allTransactions, trxDetail, filterTrx, allAdjusmtments, systemLog};