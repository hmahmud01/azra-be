import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const orgReport = async(req, res, next) => {
    let earned = 0;
    let success_recharge_count = 0;
    let failed_recharge_count = 0;
    let total_sales = 0;
    let earned_record = []
    let result = await prisma.organizationEarned.findMany({
        include: {
            trx: true,
            api: true
        }
    });

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

    let trx = await prisma.transaction.findMany({})

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

const allTransactions = async(req, res, next) => {
    let result = await prisma.transaction.findMany({
        include:{
            doneBy: true,
            country: true,
            mobile: true,
            service: true
        }
    });

    let trx = []

    for (let i = 0; i<result.length; i++){
        let data = {
            trxId: result[i].id,
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
    const tid = parseInt(req.params.id)
    let result = await prisma.transaction.findFirst({
        where: {
            id: tid
        },
        include:{
            doneBy: true,
            country: true,
            mobile: true,
            service: true
        }
    })
    res.status(200).json({
        message : result
    })
}

const filterTrx = async(req, res, next) => {
    const data = req.body

    let earned = 0;
    let success_recharge_count = 0;
    let failed_recharge_count = 0;
    let total_sales = 0;
    let earned_record = []

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

export default {orgReport, allTransactions, trxDetail, filterTrx};