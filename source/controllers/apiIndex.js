import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const sdata = [
    {'id': 1, 'api': "ZOLO", 'code': "ZLO", "status": true},
    {'id': 2, 'api': "Etisalat", 'code': "ETS", "status": false},
]

const getApis = async(req, res, next) => {
    let result = [
        {id: 1, api: "ZOLO", code: "ZLO", status: true},
        {id: 2, api: "Etisalat", code: "ETS", status: false}
    ]

    result = await prisma.api.findMany();

    res.status(200).json({
        message: result
    })
}

const getApi = async(req, res, next) => {
    let result = {id: 1, api: "ZOLO", code: "ZLO", status: true}
    let id = req.params.id
    console.log(`fetcing data for ${id}`)

    res.status(200).json({
        message: result
    })
}

const deActivateApi = async(req, res, next) => {
    let id = req.params.id
    console.log(`deactivating the api with id of ${id}`)

    res.status(200).json({
        message: `deactivated ${id}`
    })
}

const activateApi = async(req, res, next) => {
    let id = req.params.id
    console.log(`activating the api with id of ${id}`)

    res.status(200).json({
        message: `activated ${id}`
    })
}

const addApi = async(req, res, next) => {
    console.log(req.body);

    let name = req.body.name;
    let api = req.body.api;
    let code = req.body.code;
    let status = true ? req.body.status == "active" : false;

    let data = {
        name: name,
        code: code,
        status: status
    }

    const apiObj = await prisma.api.create({
        data: data
    })

    console.log(`Api : ${api} & code : ${code} & status : ${status}`)

    res.status(200).json({
        message: `Data added : ${apiObj}`
    })
}

export default {addApi, getApis, getApi, deActivateApi, activateApi}