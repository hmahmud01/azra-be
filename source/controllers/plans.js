const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.createPlan = async(req, res, next) => {
    let data = {
        operator_code: req.body.operator_code,
        circle_code: req.body.circle_code,
        rechargeType: req.body.rechargeType,
        credit_amount: req.body.credit_amount,
        credit_currency: req.body.credit_currency,
        debit_amount: req.body.debit_amount,
        debit_currency: req.body.debit_currency,
        validity: req.body.validity,
        narration: req.body.narration,
        is_range: req.body.is_range,
        api_plan_id: req.body.api_plan_id
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

exports.createPlanType = async(req, res, next) => {
    let data = {
        type: req.body.type,
        operator_code: req.body.operator_code,
        operator: req.body.operator,
        mobileId: req.body.mobileId
    }

    const plantype = await db.plantypes.create(data);

    res.status(200).json({
        message: `added data: ${plantype}`
    })
}

exports.listPlanType = async(req, res, next) => {
    const types = await db.plantypes.findAll();

    res.status(200).json({
        message: types
    })
}