import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getServices = async(req, res, next) => {
    let result = [
        {id: 1, service: "TopUp", mno: "GP"},
        {id: 2, service: "DataLoad", mno: "BanglaLink"}
    ]

    result = await prisma.teleService.findMany({
        include: {mobile: true}
    })

    console.log(result);

    res.status(200).json({
        message: result
    })
}

const listService = async(req, res, next) => {
    let result2 = await prisma.teleService.findMany({
        include: {mobile: true}
    })

    console.log(result2);

    res.status(200).json({
        message: result2
    })
}

const getService = async(req, res, next) => {
    let result = {id:1, service: "TopUp", mno: "Gp"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    res.status(200).json({
        message: result
    })
}

const updateService = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

const deleteService = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

const addService = async(req, res, next) => {
    
    let service = req.body.service
    let mno = req.body.mno

    

    const teleservice = await prisma.teleService.create({
        data: {
            name: service,
            mobile: {
                connect: {
                    id: parseInt(mno)
                }
            }
        }
    })

    console.log(teleservice)
    res.status(200).json({
        message: `added data: ${teleservice}`
    })
}

export default {getServices, listService, getService, updateService, addService, deleteService};