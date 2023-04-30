// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

const db = require("../models");
const Mobile = db.mobile;
const Country = db.country;
const Op = db.Sequelize.Op;

exports.getNetworks = async(req, res, next) => {

    let result = []

    const networks = await Mobile.findAll();
    console.log(networks); 

    for (let i=0; i<networks.length; i++){
        const country = await Country.findOne({
            where: {
                uuid: networks[i].countryId
            }
        })
        let data = {
            id: networks[i].id,
            name: networks[i].name,
            uuid: networks[i].uuid,
            createAt: networks[i].createAt,
            ctryId: networks[i].countryId,
            ctry: country.name,
            short: country.short
        }
        result.push(data)
    }

    res.status(200).json({
        message: result
    })
}

exports.listNetwork = async(req, res, next) => {
    const result = await Mobile.findAll();

    res.status(200).json({
        message: result
    })
}

exports.getNetwork = async(req, res, next) => {
    let id = req.params.id
    let result = {id: 2, mno: "Banglalink", ctry: "BD"}

    res.status(200).json({
        message: result
    })
}

exports.updateNetwork = async(req, res, next) => {
    let id = req.params.id
    msg = `updating data for id ${id}`

    console.log(msg);
    res.status(200).json({
        message: msg
    })
}

exports.deleteNetwork = async(req, res, next) => {
    let id = req.params.id
    msg = `Deleting data for id ${id}`

    console.log(msg);
    res.status(200).json({
        message: msg
    })
}

exports.addNetwork = async(req, res, next) => {
    let mno = req.body.mno
    let ctry = req.body.country

    let data = {
        name: mno,
        countryId: ctry
    }

    const network = await Mobile.create(data)

    res.status(200).json({
        message: `Network Created ${network.name}`
    })
}