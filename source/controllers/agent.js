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
    let amount = req.body.amount
    let uid = req.body.uid

    const transfer = await prisma.agentTransaction.create({
        data: {
            user: {
                connect: {
                    id: uid
                }
            },
            transferedAmount: amount,
            deductedAmount: 0.00
        }
    })
    
    console.log("transfer data, ", transfer);

    res.status(200).json({
        message: "transfer done",
        data: transfer
    })
}

export default {getAgents, getAgent, updateAgent, addAgent, deleteAgent, balanceTransfer};