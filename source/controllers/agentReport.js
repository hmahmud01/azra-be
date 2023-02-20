import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


const calculateDue = async({id}) => {
    let total = 0;
    let debit = 0;
    let credit = 0;
    console.log(id);    
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
    return total;
}

const calculateEarning = ({id}) => {
    let total = 0;
    return total;
}

const calculateSale = ({id}) => {
    let total = 0;
    return total;
}

const calculateBalance = ({id}) => {
    let total = 0;
    return total;
}


const agentReport = async(req, res, next) => {
    let result = []
    let dueval = 0
    const agents = await prisma.user.findMany({
        where: {
            type: "agent"
        }
    })

    console.log(agents);

    for(let i = 0; i<agents.length; i++){
        let dues = calculateDue(agents[i].id).then(res => console.log(res)).then(data => dueval = data);
        let sale = calculateSale(agents[i].id);
        let eraning = calculateEarning(agents[i].id);
        let balance = calculateBalance(agents[i].id);
        console.log(dueval);
        let data = {
            recharge: 0,
            dues: dues,
            sale: sale,
            earning: eraning,
            balance: balance
        }

        agents[i].data = data;
    }

    console.log(agents);

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
    console.log(uid);
    let result = []
    const dues = await prisma.userAmountSettlement.findMany({
        where: {
            userId: uid,
        },
        include: {
            user: true
        }
    })
    res.status(200).json({
        message: dues
    })
}

const agentSale = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
    const trx = await prisma.transaction.findMany({
        where: {
            userId: uid
        },
        include: {
            doneBy: true,
        }
    })
    res.status(200).json({
        message: trx
    })
}

const agentEarning = async(req, res, next) => {
    const uid = parseInt(req.params.id)
    let result = []
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
        message: earning
    })
}

const agentBalance = async(req, res, next) => {
    const uid = parseInt(req.params.id)
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
        message: atrx
    })
}

export default {agentReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}