import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getNetworks = async(req, res, next) => {
    let result = [
        {id: 1, mno: "GP", ctry: "BD"},
        {id: 2, mno: "Banglalink", ctry: "BD"},
        {id: 3, mno: "Airtel", ctry: "IND"}
    ]

    const networks = await prisma.mobile.findMany({ include: {nation: true} });
    console.log(networks); 

    res.status(200).json({
        message: networks
    })
}

const listNetwork = async(req, res, next) => {
    let result = [
        {id: 1, name: "GP", country: 1},
        {id: 2, name: "Banglalink", country: 1},
        {id: 3, name: "Airtel", country: 2},
    ]

    result = await prisma.mobile.findMany();

    res.status(200).json({
        message: result
    })
}

const getNetwork = async(req, res, next) => {
    let id = req.params.id
    console.log(id)
    let result = {id: 2, mno: "Banglalink", ctry: "BD"}

    res.status(200).json({
        message: result
    })
}

const updateNetwork = async(req, res, next) => {
    let id = req.params.id
    msg = `updating data for id ${id}`

    console.log(msg);
    res.status(200).json({
        message: msg
    })
}

const deleteNetwork = async(req, res, next) => {
    let id = req.params.id
    msg = `Deleting data for id ${id}`

    console.log(msg);
    res.status(200).json({
        message: msg
    })
}

const addNetwork = async(req, res, next) => {
    let mno = req.body.mno
    let ctry = req.body.country

    const country = await prisma.nation.findFirst({
        where: {
            id: parseInt(ctry)
        }
    })

    console.log(country);

    console.log("mno : ", mno, "ctry : ", ctry);
    let response = `data creating for ${mno}`

    const network = await prisma.mobile.create({
        data: {
            name: mno,
            nation: {
                connect: {
                    id: parseInt(ctry)
                }
            }
        },
        include: { nation: true}
    })

    console.log(network, {depth: Infinity})

    res.status(200).json({
        message: network
    })
}

export default { getNetworks, listNetwork, getNetwork, updateNetwork, deleteNetwork, addNetwork };