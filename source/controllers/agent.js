import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getAgents = async(req, res, next) => {
    let result = [
        {id: 1, name: "Mr. Y", manager: "Mr. X", area: "Location"},
        {id: 2, name: "Mr. Z", manager: "Mr. X", area: "Location"},
    ]

    res.status(200).json({
        message: result
    })
}

const getAgent = async(req, res, next) => {
    let result = {id: 2, name: "Mr. Z", manager: "Mr. X", area: "Location"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    res.status(200).json({
        message: result
    })
}

const updateAgent = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

const deleteAgent = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

const addAgent = async(req, res, next) => {
    let name = req.body.name
    let phone = req.body.phone
    let manger = req.body.manager
    let area = req.body.city

    console.log(`agent : ${name} and phone : ${phone}`)
    res.status(200).json({
        message: "adding data" 
    })
}



const balanceTransfer = async(req, res, next) => {
    console.log("inside balacne")
    let amount = req.body.amount
    let uid = req.body.uid
    let id = req.params.id

    console.log(`Id is :${id}`)

    const transfer = await prisma.agentTransaction.create({
        data: {
            user: {
                connect: {
                    id: parseInt(id)
                }
            },
            transferedAmount: amount,
            deductedAmount: 0.00
        }
    })
    
    console.log("transfer data, ", transfer);

    const settlement = await prisma.userAmountSettlement.create({
        data: {
            user: {
                connect: {
                    id: parseInt(id)
                }
            },
            debit: 0.00,
            credit: amount,
            note: "User Credit Data"
        }
    })

    res.status(200).json({
        message: "transfer done",
        data: transfer
    })
}

const settleDebt = async(req, res, next)=> {
    const uid = req.body.uid
    const amount = req.body.amount
    let id = req.params.id

    console.log(`Id is :${id}`)

    const settlement = await prisma.userAmountSettlement.create({
        data: {
            user: {
                connect: {
                    id: parseInt(id)
                }
            },
            debit: amount,
            credit: 0.00,
            note: "User Credit withdrawn"
        }
    })

    res.status(200).json({
        message: "SUCCESS"
    })
}

const assignPercent = async(req, res, next) => {
    const uid = req.body.uid
    const percent = req.body.percent
    let id = req.params.id

    console.log(`Id is :${id}`)

    const percentAssign = await prisma.agentPercentage.update({
        where: {
            userId: parseInt(id)
        },
        data: {
            percentage: percent
        }
    })

    res.status(200).json({
        message: "SUCCESS"
    })
}

// remove adjusted amounts
function excludeAmount(balance, keys) {
    for (let key of keys) {
      delete balance[key]
    }
    return balance
}

const transferData = async(req, res, next) => {
    let id = req.params.id

    const data = await prisma.agentTransaction.findMany({
        where: {
            userId: parseInt(id)
        }
    })

    const dataRe = excludeAmount(data, ['deductedAmount'])

    console.log(`inside data transfer for ${id}`)

    res.status(200).json({
        message: dataRe
    })
}

// remove adjusted amounts
function excludeCredit(withdrawal, keys) {
    for (let key of keys) {
      delete balance[key]
    }
    return withdrawal
}

const withdrawData = async(req, res, next) => {
    console.log(req.params);
    let id = req.params.id
    console.log(id);
    const data = await prisma.userAmountSettlement.findMany({
        where: {
            userId: parseInt(id)
        }
    })

    const dataRe = excludeCredit(data, ['credit'])

    console.log(`inside data withdraw for ${id}`)
    console.log(dataRe)

    res.status(200).json({
        message: dataRe
    })
    
}

const percentData = async(req, res, next) => {
    console.log(req.params);
    let id = req.params.id
    console.log(id);
    const data = await prisma.agentPercentage.findMany({
        where: {
            userId: parseInt(id)
        }
    })

    console.log(`inside data percent for ${id}`)
    console.log(data);
    res.status(200).json({
        message: data
    })
}

const allUserList = async(req, res, next) => {
    const data = await prisma.user.findMany();

    res.status(200).json({
        message: data
    })
}

export default {getAgents, getAgent, updateAgent, addAgent, deleteAgent, balanceTransfer, settleDebt, assignPercent, transferData, withdrawData, percentData, allUserList};