import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getApis = async (req, res, next) => {
    let result = await prisma.api.findMany();

    res.status(200).json({
        message: result
    })
}

const getApi = async (req, res, next) => {
    let result = { id: 1, api: "ZOLO", code: "ZLO", status: true }
    let id = req.params.id
    console.log(`fetcing data for ${id}`)

    res.status(200).json({
        message: result
    })
}

const deActivateApi = async (req, res, next) => {
    let id = req.params.id
    console.log(`deactivating the api with id of ${id}`)

    const updateapi = await prisma.api.update({
        where: { 
            uuid: id
        },
        data: {
            status: false,
        }
    });

    console.log(updateapi);
    res.status(200).json({
        message: `deactivated ${id}`,
        status: updateapi.status
    })
}

const activateApi = async (req, res, next) => {
    let id = req.params.id
    console.log(`activating the api with id of ${id}`)
    const updateapi = await prisma.api.update({
        where: { uuid: id },
        data: {
            status: true,
        }
    });

    console.log(updateapi);
    res.status(200).json({
        message: `activated ${id}`,
        status: updateapi.status
    })
}

const addApi = async (req, res, next) => {
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
        message: `API added for ${apiObj.code}`
    })
}

const assignPriority = async (req, res, next) => {
    let data = req.body;
    let ctryId = data.ctry;

    for (let i = 0; i < data.apiPriority.length; i++) {
        const existingData = await prisma.apiCountryPriority.findFirst({
            where: {
                ctry: {
                    is: {
                        id: ctryId
                    }
                },
                api: {
                    is: {
                        id: data.apiPriority[i].apiId
                    }
                }
            }
        })

        if(existingData){
            console.log(`DATA EXISTING FOR ${ctryId} and ${data.apiPriority[i].apiId}`)
        }else{
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
    }


    res.status(200).json({
        message: "Priority Assignment Complete"
    })
}

const assingPercentage = async (req, res, next) => {
    let msg = ""
    let status_code = 200
    const existingData = await prisma.apiPercent.findFirst({
        where: {    
            api: {
                is: {
                    id: req.body.api
                }
            },
            network: {
                is:{
                    id: req.body.network
                }
            }
        }
    })

    if (existingData){
        console.log(existingData);
        msg = "Percentage Combination Already exists"
        status_code = 400
    }else {
        const percent = await prisma.apiPercent.create({
            data: {
                api: {
                    connect: {
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
        msg = "Percent Assignment COmplete"
        status_code = 200
    }

    
    res.status(status_code).json({
        message: msg
    })
}

const apiPriorityData = async (req, res, next) => {

    console.log("inside priority Data");
    let data = []
    let result = await prisma.apiCountryPriority.findMany({
        include: {
            api: true,
            ctry: true,
        }
    });

    for (let i = 0; i < result.length; i++) {
        let store = {
            id: result[i].id,
            uuid: result[i].uuid,
            priority: result[i].priority,
            apiId: result[i].apiId,
            api: result[i].api.name,
            ctry: result[i].ctry.name,
            short: result[i].ctry.short,
            ctryId: result[i].nationId,
        }
        data.push(store);
    }

    res.status(200).json({
        message: data
    })
}

const apiPercentageData = async (req, res, next) => {
    console.log("inside Percentage Data");
    let data = []
    let result = await prisma.apiPercent.findMany({
        include: {
            api: true,
            network: true
        }
    });

    for (let i = 0; i < result.length; i++) {
        let store = {
            id: result[i].id,
            uuid: result[i].uuid,
            percent: result[i].percent,
            apiId: result[i].apiId,
            api: result[i].api.name,
            mobileId: result[i].mobileId,
            networkName: result[i].network.name,
        }
        data.push(store)
    }
    res.status(200).json({
        message: data
    })
}


const updatePercentage = async (req, res, next) => {
    const percent = await prisma.apiPercent.update({
        where: {
            uuid: req.body.id
        },
        data: {
            percent: req.body.percentage
        }
    })

    res.status(200).json({
        message: percent
    })
}

const updatePriority = async (req, res, next) => {
    const priority = await prisma.apiCountryPriority.update({
        where: {
            uuid: req.body.id
        },
        data: {
            priority: req.body.priority
        }
    })

    res.status(200).json({
        message: priority
    })
}

export default { addApi, getApis, getApi, deActivateApi, activateApi, assingPercentage, assignPriority, apiPriorityData, apiPercentageData, updatePercentage, updatePriority }