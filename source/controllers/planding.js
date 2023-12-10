const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.createdingplan = async(req, res, next) => {
    let data = {
        operator: req.body.operator,
        type: req.body.type,
        country: req.body.country,
        skucode: req.body.skucode,
        providercode: req.body.providercode,
        send_amount: req.body.send_amount,
        send_currency: req.body.send_currency,
        receive_amount: req.body.receive_amount,
        receive_currency: req.body.receive_currency,
        plan_id: req.body.plan_id
    }

    const ding = db.planding.create(data)

    res.status(200).json({
        msg: `DING PLAN ADDED : ${ding.uuid}`
    })

}

exports.listdingplan = async(req, res, next) => {
    const dingplans = db.planding.findAll()

    res.status(200).json({
        msg: dingplans
    })
}