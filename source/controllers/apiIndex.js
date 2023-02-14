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
    let id = parseInt(req.params.id)
    console.log(`deactivating the api with id of ${id}`)

    const updateapi = await prisma.api.update({
        where: { id: id },
        data: {
            status: false,
        }
    });

    console.log(updateapi);
    res.status(200).json({
        message: `deactivated ${id}`
    })
}

const activateApi = async(req, res, next) => {
    let id = parseInt(req.params.id)
    console.log(`activating the api with id of ${id}`)
    const updateapi = await prisma.api.update({
        where: { id: id },
        data: {
            status: true,
        }
    });

    console.log(updateapi);
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

const assignPriority = async(req, res, next) => {
   let dummydata = {
        ctry: 1,
        apiPriority: [ { apiId: 3, priority: 2 }, { apiId: 2, priority: 3 } ]
      }
    console.log(req.body);

    let data = req.body;
    let ctryId = data.ctry;
    for (let i = 0; i<data.apiPriority.length; i++){
        const priority = await prisma.apiCountryPriority.create({
            data: {
                ctry: {
                    connect: {
                        id: ctryId
                    }
                },
                api: {
                    connect: {
                        id: data.apiPriority[i].apiId
                    }
                },
                priority: data.apiPriority[i].priority
            }
        })
    }


    res.status(200).json({
        message: "Priority Assignment Complete"
    })
}

const assingPercentage = async(req, res, next) => {
    const percent = await prisma.apiPercent.create({
        data: {
            api: {
                connect:{
                    id: req.body.api
                }
            },
            network: {
                connect: {
                    id: req.body.network
                }
            },
            percent: req.body.percentage
        }
    })

    console.log(percent);
    res.status(200).json({
        message: "Percent Assignment COmplete"
    })
}

const apiPriorityData = async(req, res, next) => {
    console.log("inside priority Data");
    let result = await prisma.apiCountryPriority.findMany({
        include: {
            api: true,
            ctry: true,
        }
    });
    res.status(200).json({
        message: result
    })
}   

const apiPercentageData = async(req, res, next) => {
    console.log("inside Percentage Data");
    let result =await prisma.apiPercent.findMany({
        include:{
            api: true,
            network: true
        }
    }); 
    res.status(200).json({
        message: result
    })
}

export default {addApi, getApis, getApi, deActivateApi, activateApi, assingPercentage, assignPriority, apiPriorityData, apiPercentageData}