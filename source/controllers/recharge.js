const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.plans = async(req, res, next) => {
    let service_code = req.body.service_code
    let country_code = req.body.country_code
    let circle_code = req.body.circle_code
    let operator_code = req.body.operator_code
    let username = req.body.username
    let ui_number = req.body.ui_number

    console.log("REQUEST BODY")
    console.log(req.body)

    const grp = []

    const groups = await db.plantypes.findAll({
        where: {
            operator_code: {
                [Op.startsWith]: operator_code
            }
        }
    })

    console.log("PRINTING GROUPS")
    console.log(groups)

    for (let i=0; i<groups.length; i++){
        console.log("GROUP OPERATAOR CODE")
        console.log(groups[i].operator_code)
        const plandata = await db.plans.findAll({
            where: {
                operator_code: groups[i].operator_code,
                circle_code: circle_code
            }
        })
        console.log("PLAN DATA FILTERED")
        console.log(plandata)
        let plans = []
        for(let j=0; j<plandata.length; j++){
            let data = {
                plan_id: plandata[j].uuid,
                operator_code: plandata[j].operator_code,
                circle_code: plandata[j].circle_code,
                credit_amount: plandata[j].credit_amount,
                credit_currency: plandata[j].credit_currency,
                debit_amount: plandata[j].debit_amount,
                debit_currency: plandata[j].debit_currency,
                validity: plandata[j].validity,
                narration: plandata[j].narration,
                is_range: plandata[j].is_range,
                api_plan_id: plandata[j].api_plan_id,
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
        "username": "iftay",
        "sub_operator_code": "GNP_TALK",
        "country_code": "BD",
        "service_code": "MR",
        "ui_number": "1716920198",
        "plan_amount": "16.00000",
        "plan_id": "10371",
        "circle_code": "BD",
        "prefix": "880"
    }

    let username = req.body.username
    let sub_operator_code = req.body.sub_operator_code
    let country_code = req.body.country_code
    let service_code = req.body.service_code
    let ui_number = req.body.ui_number
    let plan_amount = req.body.plan_amount
    let plan_id = req.body.plan_id
    let circle_code =req.body.circle_code
    let prefix = req.body.prefix

    const plan = await db.plans.findOne({
        where: {
            uuid: plan_id
        }
    })

    var result = "success || failed"
    res.json({
        msg : `rechargin for ${plan.debit_amount}`
    })
}

exports.customerBalanceTransferRequest = async(req, res, next) => {
    let customer = req.body.username_customer
    let amount = req.body.amount
    let narration = req.body.narration

    const user = await db.user.findOne({
        where: {
            phone: customer
        }
    })

    const transfer = await db.agenttransaction.create({
        userId: user.uuid,
        transferedAmount: parseFloat(amount),
        dedcutedAmount: 0.00
    })

    const settlement = await db.useramountsettlement.create({
        userId: user.uuid,
        debit: 0.00,
        credit: parseFloat(amount),
        note: narration
    })

    const logsms = `Amount ${amount} has been transferred to ${customer}'s account`
    const syslog = await db.systemlog.create({
        type: "Transfer",
        detail: logsms
    })

    res.status(200).json({
        message: "transfer Done",
        data: transfer
    })
}

exports.userGetPortalBalance = async(req, res, next) => {
    let username = req.body.username
    let mainBalance = 0.00;
    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })

    const agentTrx = await db.agenttransaction.findAll({
        where: {
            userId: user.uuid
        }
    })

    for (let i = 0; i < agentTrx.length; i++) {
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].dedcutedAmount
    }

    console.log(`main balance from trasaction calculation , ${mainBalance}`)
    const lockedbalances = await db.lockedbalance.findAll({
        where: {
            lockedStatus: true,
            userId: user.uuid
        }
    })

    let pendingRecharge = 0.00

    for (let i = 0; i < lockedbalances.length; i++) {
        pendingRecharge += lockedbalances[i].amountLocked
    }

    console.log(`Pending Balance: ${pendingRecharge}`);
    let actualbalance = mainBalance - pendingRecharge

    res.status(200).json({
        message: "portal balance request",
        data: username,
        balance: actualbalance
    })
}