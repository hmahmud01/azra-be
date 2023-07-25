const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.createPlan = async(req, res, next) => {
    let data = {
        apiProviderId: req.body.apiProviderId,
        operatorCode: req.body.operatorCode,
        countryId: req.body.countryId,
        rechargeType: req.body.rechargeType,
        amount: req.body.amount,
        daylimit: req.body.daylimit,
    }

    const plan = await db.plans.create(data);

    res.status(200).json({
        message: `added data: ${plan}`
    })
}

exports.listPlan = async(req, res, next) => {
    const list = await db.plans.findAll();

    res.status(200).json({
        message: list
    })
}