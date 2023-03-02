import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const calculateDue = async(id) => {
    let total = 0;
    let debit = 0;
    let credit = 0;
    // console.log(id);    
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            userId: id,
        }
    })

    // console.log(dues);
    for(let i=0; i<dues.length; i++){
        debit += dues[i].debit
        credit += dues[i].credit
    }

    total = debit-credit

    console.log("remaing: ", total);
    return {total: total};
}

const calculateEarning = async(id) => {
    let total = 0;
    let result = []
    const earning = await prisma.agentEarning.findMany({
        where: {
            userId: id
        }
    })

    for(let i=0; i<earning.length; i++){
        total += earning[i].amount
    }
    return {earn: total};
}

const calculateSale = async(id) => {
    let total = 0;
    let result = []
    const trx = await prisma.transaction.findMany({
        where: {
            userId: id
        }
    })

    for(let i= 0; i<trx.length; i++){
        total+= trx[i].amount
    }
    return {sale: total};
}

const calculateBalance = async(id) => {
    let total = 0;
    let transfer = 0;
    let deduct = 0;
    const atrx = await prisma.agentTransaction.findMany({
        where: {
            userId: id
        }
    })

    for (let i = 0; i<atrx.length; i++){
        transfer += atrx[i].transferedAmount
        deduct += atrx[i].deductedAmount
    }

    total = transfer - deduct

    return {balance: total};
}


const agentReport = async(req, res, next) => {
    let result = []
    let dueval = 0
    let saleval = 0
    let earnval = 0
    let balanceval = 0
    const agents = await prisma.user.findMany({
        where: {
            type: "agent"
        }
    })

    for(let i = 0; i<agents.length; i++){
        let dues = await calculateDue(agents[i].id).then(res => {dueval = res.total});
        let sale = await calculateSale(agents[i].id).then(res => {saleval = res.sale});
        let eraning = await calculateEarning(agents[i].id).then(res => {earnval = res.earn});
        let balance = await calculateBalance(agents[i].id).then(res => {balanceval = res.balance});
        let data = {
            recharge: 0,
            dues: dueval,
            sale: saleval,
            earning: earnval,
            balance: balanceval
        }

        agents[i].data = data;
    }

    // console.log(agents);

    res.status(200).json({
        message: agents
    })
}

const agentRecharge = async(req, res, next) => {
    const uid = parseInt(req.params.uid)
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentDues = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
    let due = await calculateDue(uid);
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            userId: uid,
        },
        include: {
            user: true
        }
    })
    res.status(200).json({
        message: dues,
        due: due.total
    })
}

const agentSale = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
    let sale = await calculateSale(uid)
    const trx = await prisma.transaction.findMany({
        where: {
            userId: uid
        },
        include: {
            doneBy: true,
        }
    })
    res.status(200).json({
        message: trx,
        sale: sale.sale
    })
}

const agentEarning = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
    let earn = await calculateEarning(uid)
    const earning = await prisma.agentEarning.findMany({
        where: {
            userId: uid
        },
        include: {
            agent: true,
            trx: true
        }
    })
    res.status(200).json({
        message: earning,
        earn: earn.earn
    })
}

const agentBalance = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let balance = await calculateBalance(uid)
    const atrx = await prisma.agentTransaction.findMany(
        {
            where: {
                userId: uid
            },
            include: {
                user: true
            }
        }
    )
    res.status(200).json({
        message: atrx,
        balance: balance.balance
    })
}

export default {agentReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}