import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const orgReport = async(req, res, next) => {
    let earned = 0;
    let recharge_count = 0;
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
    res.status(200).json({
        message: earned_record,
        total_earned: earned
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
            id: id
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

export default {orgReport, allTransactions, trxDetail};