const db = require("../models");
const Op = db.Sequelize.Op;
const Api = db.api;
const ApiCountryPriority = db.apicountrypriority;
const ApiPercent = db.apipercent;
const Country = db.country;
const Mobile = db.mobile;


exports.getApis = async (req, res, next) => {
    let result = await Api.findAll();

    res.status(200).json({
        message: result
    })
}

exports.getApi = async (req, res, next) => {
    let result = { id: 1, api: "ZOLO", code: "ZLO", status: true }
    let id = req.params.id
    console.log(`fetcing data for ${id}`)

    const api = await Api.findOne({
        where: {
            uuid: id
        }
    })

    res.status(200).json({
        message: result
    })
}

exports.deActivateApi = async (req, res, next) => {
    let id = req.params.id
    console.log(`deactivating the api with id of ${id}`)

    const updateapi = await Api.update(
        {
            status: false,
        },
        {
            where: { 
                uuid: id
            }
        }
    );

    console.log(updateapi);
    res.status(200).json({
        message: `deactivated ${id}`,
        status: updateapi.status
    })
}

exports.activateApi = async (req, res, next) => {
    let id = req.params.id
    console.log(`activating the api with id of ${id}`)
    const updateapi = await Api.update(
        {
            status: true,
        },
        {
            where: { 
                uuid: id
            }
        }
    );

    console.log(updateapi);
    res.status(200).json({
        message: `activated ${id}`,
        status: updateapi.status
    })
}

exports.addApi = async (req, res, next) => {
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

    const apiObj = await Api.create(data)

    console.log(`Api : ${api} & code : ${code} & status : ${status}`)

    res.status(200).json({
        message: `API added for ${apiObj.code}`
    })
}

exports.assignPriority = async (req, res, next) => {
    let data = req.body;
    let ctryId = data.ctry;

    for (let i = 0; i < data.apiPriority.length; i++) {
        console.log(data.apiPriority[i]);

        let dataVal = {
            apiId: data.apiPriority[i].apiId,
            countryId: ctryId,
            priority: data.apiPriority[i].priority
        }

        // const priority = await ApiCountryPriority.create(dataVal)
        // console.log(priority)
        const existingData = await ApiCountryPriority.findOne({
            where: {
                countryId: ctryId,
                apiId: data.apiPriority[i].apiId
            }
        })

        if(existingData){
            console.log(`DATA EXISTING FOR ${ctryId} and ${data.apiPriority[i].apiId}`)
        }else{
            const priority = await ApiCountryPriority.create({
                countryId: ctryId,
                apiId: data.apiPriority[i].apiId,
                priority: data.apiPriority[i].priority
            })
        }
    }


    res.status(200).json({
        message: "Priority Assignment Complete"
    })
}

exports.assingPercentage = async (req, res, next) => {
    let msg = ""
    let status_code = 200

    // const percent = await ApiPercent.create({
    //     apiId: req.body.api,
    //     mobileId: req.body.network,
    //     percent: req.body.percentage
    // })
    const existingData = await ApiPercent.findOne({
        where: {    
            apiId: req.body.api,
            mobileId: req.body.network
        }
    })

    if (existingData){
        console.log(existingData);
        msg = "Percentage Combination Already exists"
        status_code = 400
    }else {
        const percent = await ApiPercent.create({
            apiId: req.body.api,
            mobileId: req.body.network,
            percent: req.body.percentage
        })
    
        console.log(percent);
        msg = "Percent Assignment COmplete"
        status_code = 200
    }

    
    res.status(status_code).json({
        message: msg
    })
}

exports.apiPriorityData = async (req, res, next) => {

    console.log("inside priority Data");
    let data = []
    let result = await ApiCountryPriority.findAll();

    console.log(result)

    for (let i = 0; i < result.length; i++) {
        let ctry = await Country.findOne({where: {uuid: result[i].countryId}})
        let api = await Api.findOne({where: {uuid: result[i].apiId}})
        let store = {
            id: result[i].id,
            uuid: result[i].uuid,
            priority: result[i].priority,
            apiId: result[i].apiId,
            api: api.name,
            ctry: ctry.name,
            short: ctry.short,       
            ctryId: result[i].countryId,
        }
        data.push(store);
    }

    res.status(200).json({
        message: data
    })
}

exports.apiPercentageData = async (req, res, next) => {
    console.log("inside Percentage Data");
    let data = []
    let result = await ApiPercent.findAll();

    console.log(result)

    for (let i = 0; i < result.length; i++) {
        let network = await Mobile.findOne({where: {uuid: result[i].mobileId}})
        let api = await Api.findOne({where: {uuid: result[i].apiId}})
        let store = {
            id: result[i].id,
            uuid: result[i].uuid,
            percent: result[i].percent,
            apiId: result[i].apiId,
            api: api.name,
            mobileId: result[i].mobileId,
            networkName: network.name,
        }
        data.push(store)
    }
    res.status(200).json({
        message: data
    })
}


exports.updatePercentage = async (req, res, next) => {
    const percent = await ApiPercent.update(
        {
        percent: req.body.percentage,
        },{
            where: {
                uuid: req.body.id
            }
        }
    )

    res.status(200).json({
        message: percent
    })
}

exports.updatePriority = async (req, res, next) => {
    const priority = await ApiCountryPriority.update(
        {
            priority: req.body.priority
        },
        {
            where: {
                uuid: req.body.id
            },
        }
    )

    res.status(200).json({
        message: priority
    })
}