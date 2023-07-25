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

    let operatorCode = ""
    let countryId = ""
    let rechargeType = ""

    let exchange_rate = ""
    let groups = [{
        type: "",
        operator_code: "",
        plans: [{
            "plan_id": 10888,
			"operator_code": "ETS_NBA",
			"circle_code": "AE",
			"credit_amount": "30.00000",
			"credit_currency": "AED",
			"debit_amount": "30.00000",
			"debit_currency": "AED",
			"validity": 0,
			"narration": "30 Inter mint daily for 30 days. AED 30",
			"is_range": "1",
			"tags": [],
			"api_plan_id": 55773518
        }]
    }]

    const plan_list = await db.plans.findAll({
        where: {
            rechargeType: data.service_code,
            operatorCode: data.operator_code,
            countryId: country.uuid
        }
    })

    const plans = await db.plans.findAll({})

    res.json({
        msg: plan_list
    })
}

exports.operatorCheck = async(req, res, next) => {

    let service_code = req.body.service_code
    let country_code = req.body.country_code
    let ui_number = req.body.ui_number
    let prefix = req.body.prefix

    let logo = ""


    if (ui_number.startsWith("17")){
        logo = "GRAMEEN_PHONE"
    }else if(ui_number.startsWith("18")){
        logo = "ROBI"
    }else if(ui_number.startsWith("19")){
        logo = "BANGLALINK"
    }

    const operatorsetting = await db.mobilesetting.findOne({
        where: {
            serviceCode: service_code,
            callingCode: prefix,
            logo: logo
        }
    })

    const operator = await db.mobile.findOne({
        where: {
            uuid: operatorsetting.mobileId
        }
    })


    var res_data = operator.name

    if (operator.name == "grameen") {
        res_data={"operator_code": "GNP", "circle_code": country_code}
    }else if(operator.name == "banglalink"){
        res_data={"operator_code": "BL", "circle_code": country_code}
    }else if(operator.name == "robi"){
        res_data={"operator_code": "ROBI", "circle_code": country_code}
    }

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