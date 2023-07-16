const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.getWalletBalane = async(req, res, next) => {
    var data = {
        username_customer : "",
        vouce_date : "2023-5-21",
        amount : 20,
        narration : "need fund"
    }
    let balance = 20.9

    res.json({
        msg: balance
    })
}

exports.plans = async(req, res, next) => {
    // filter plan list
    var data = {
        service_code: "MR",
        country_code: "BD",
        circle_code: "BD",
        operator_code: "GNP",
        username: "user",
        ui_number: "1716565656"
    }

    var res_list = []

    const country = await db.country.findOne({
        where: {
            short: data.country_code
        }
    })

    const plan_list = await db.plans.findAll({
        where: {
            rechargeType: data.service_code,
            operatoratorCode: data.operator_code,
            countryId: country.uuid
        }
    })

    const plans = await db.plans.findAll({})

    res.json({
        msg: plan_list
    })
}

exports.operatorCheck = async(req, res, next) => {
    // check mobile network here
    var data = {
        service_code: "",
        country_code: "",
        ui_number: "",
        prefix: ""
    }

    const operatorsetting = await db.mobilesetting.findOne({
        where: {
            serviceCode: data.service_code,
            callingCode: data.prefix
        }
    })

    const operator = await db.mobile.findOne({
        where: {
            uuid: operatorsetting.mobileId
        }
    })


    var res_data = operator.name

    res.json({
        msg: res_data
    })
}

exports.recharge = async(req, res, next) => {

    var data = {
        username: "username",
        sub_operator_code: "GNP_TALK",
        country_code: "BD",
        service_code: "MR",
        ui_number: "175590",
        plan_amount: 16.00,
        plan_id: 10371,
        circle_code: "BD",
        prefix: "880"
    }

    var result = "success || failed"
    res.json({
        msg : "recharge stats"
    })
}