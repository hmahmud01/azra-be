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
    let service_code = req.body.service_code
    let country_code = req.body.country_code
    let circle_code = req.body.circle_code
    let operator_code = req.body.operator_code
    let username = req.body.username
    let ui_number = req.body.ui_number

    const grp = []

    const groups = await db.plantypes.findAll({
        where: {
            operator_code: {
                [Op.startsWith]: operator_code
            }
        }
    })

    for (let i=0; i<groups.length; i++){
        console.log(groups[i].operator_code)
        const plandata = await db.plans.findAll({
            where: {
                operator_code: groups[i].operator_code,
                circle_code: circle_code
            }
        })
        console.log(plandata)
        let plans = []
        for(let j=0; j<plandata.length; j++){
            let data = {
                operator_code: plandata[i].operator_code,
                circle_code: plandata[i].circle_code,
                credit_amount: plandata[i].credit_amount,
                credit_currency: plandata[i].credit_currency,
                debit_amount: plandata[i].debit_amount,
                debit_currency: plandata[i].debit_currency,
                validity: plandata[i].validity,
                narration: plandata[i].narration,
                is_range: plandata[i].is_range,
                api_plan_id: plandata[i].api_plan_id,
                tags: []
            }
            plans.push(data)
        }

        let grpdata = {
            type: groups[i].type,
            operator_code: groups[i].operator_code,
            plans: plans
        }
        grp.push(grpdata)
    }

    let finalData = {
        exchange_rate: "",
        groups: grp
    }

    res.json(finalData)
}

exports.operatorCheck = async(req, res, next) => {

    let service_code = req.body.service_code
    let country_code = req.body.country_code
    let ui_number = req.body.ui_number
    let prefix = req.body.prefix

    let mobId= ""
    let setting = {}

    const operatorsetting = await db.mobilesetting.findAll({
        where: {
            serviceCode: service_code,
            callingCode: prefix,
        }
    })

    for (let i=0; i<operatorsetting.length; i++){
        if (ui_number.startsWith(operatorsetting[i].startsWith)){
            mobId = operatorsetting[i].mobileId
            setting = operatorsetting[i]
            break
        }
    }

    const operatorCode = await db.operatorCode.findOne({
        where: {
            mobileId: mobId
        }
    })

    const country = await db.country.findOne({
        where: {
            uuid: operatorCode.countryId
        }
    })

    var res_data = {
        operator_code: operatorCode.operatorCode,
        circle_code: country.short
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