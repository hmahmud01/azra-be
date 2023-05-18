const db = require("../models");
const Service = db.service;
const Mobile = db.mobile;
const Op = db.Sequelize.Op;

exports.getServices = async(req, res, next) => {
    let result = []
    let services = []

    result = await Service.findAll();

    for(let i=0; i<result.length;i++){
        const mobile = Mobile.findOne({
            where: {
                uuid: result[i].mobileId
            }
        })
        let data = {
            id: result[i].id,
            uuid: result[i].uuid,
            name: result[i].name,
            createAt: result[i].createAt,
            network: mobile.name
        }

        services.push(data)
    }

    console.log(result);

    res.status(200).json({
        message: services
    })
}

exports.filterServices = async(req, res, next) => {
    const result = await Service.findAll({
        where: {
            mobileId: req.params.id
        }
    })

    res.status(200).json({
        message: result
    })
}

exports.listService = async(req, res, next) => {
    let result2 = await Service.findAll()

    console.log(result2);

    res.status(200).json({
        message: result2
    })
}

exports.getService = async(req, res, next) => {
    let result = {id:1, service: "TopUp", mno: "Gp"}
    let id = req.params.id
    console.log(`Data for id ${id} is `, result)

    const service = Service.findOne({
        where: {
            uuid: id
        }
    })

    res.status(200).json({
        message: result
    })
}

exports.updateService = async(req, res, next) => {
    let response = `updating for id ${req.params.id}`

    res.status(200).json({
        message: response
    })
}

exports.deleteService = async(req, res, next) => {
    res.status(200).json({
        message: `Data deleting for id ${req.params.id}`
    })
}

exports.addService = async(req, res, next) => {
    
    let service = req.body.service
    let mno = req.body.mno

    let data = {
        name: service,
        mobileId: mno,
    }

    const teleservice = await Service.create(data)

    console.log(teleservice)
    res.status(200).json({
        message: `added data: ${teleservice.name}`
    })
}