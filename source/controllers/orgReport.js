import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const orgReport = async(req, res, next) => {
    let result = await prisma.organizationEarned.findMany({
        include: {
            trx: true,
            api: true
        }
    });
    res.status(200).json({
        message: result
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

export default {orgReport, allTransactions};