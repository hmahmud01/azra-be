import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getNetworks = async(req, res, next) => {

    let result = []

    const networks = await prisma.mobile.findMany({ include: {nation: true} });
    console.log(networks); 

    for (let i=0; i<networks.length; i++){
        let data = {
            id: networks[i].id,
            name: networks[i].name,
            createAt: networks[i].createAt,
            ctry: networks[i].nation.name,
            short: networks[i].nation.short
        }

        result.push(data)
    }


    res.status(200).json({
        message: result
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