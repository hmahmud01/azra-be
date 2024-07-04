const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");
const { accessLog } = require("../authsrc/middlewares")

exports.createPlan = async(req, res, next) => {
    accessLog.info(`CREATE A PLAN|${JSON.stringify(req.body)}`)
    let is_range = false
    if(req.body.is_range == "True"){
        is_range = true
    }
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
        is_range: is_range,
        productcode: req.body.productcode,
        api_plan_id: req.body.api_plan_id
    }

    const plan = await db.plans.create(data);

    res.status(200).json({
        message: `added data: ${plan}`
    })
}

exports.dummyPlan = async(req, res, next) => {
    console.log("LOGGIN DUMMY BODY")
    console.log(req.body)

    accessLog.info(`CREATE A PLAN|${JSON.stringify(req.body)}`)
    let is_range = false
    if(req.body.is_range == "True"){
        is_range = true
    }
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
        is_range: is_range,
        api_plan_id: req.body.api_plan_id
    }

    const plan = await db.plans.create(data);

    for(let value of req.body.values){
        console.log(value)
        console.log(value.priority)
        let priority_data = {
            plan_id: plan.uuid,
            api: value.apiId,
            value: value.priority
        }
        const planapi = await db.planapi.create(priority_data)
    }

    res.status(200).json({
        message: `DATA ADDING`
    })
}

exports.listPlan = async(req, res, next) => {
    accessLog.info(`ACCESS PLAN LIST | WEB ADMIN`)
    const list = await db.plans.findAll();
    let plans = []

    for(let i=0; i<list.length; i++){
        const api = await db.api.findOne({
            where: {
                uuid: list[i].api_plan_id
            }
        })

        console.log(api)

        let is_range = "False"
        if(list[i].is_range == true) {
            is_range = "True"
        }

        let res = []
        const values = await db.planapi.findAll({
            where: {
                plan_id: list[i].uuid
            }
        })

        if(values){
            for (let value of values){
                let obj = {
                    api: value.api,
                    value: value.value
                }
    
                res.push(obj)
            }
        }        

        let data = {
            api_plan : api.name,
            operator_code: list[i].operator_code,
            circle_code: list[i].circle_code,
            credit_amount: list[i].credit_amount,
            credit_currency: list[i].credit_currency,
            debit_amount: list[i].debit_amount,
            debit_currency: list[i].debit_currency,
            is_range: is_range,
            narration: list[i].narration,
            rechargeType: list[i].rechargeType,
            productcode: list[i].productcode,
            values: JSON.stringify(res)
        }

        plans.push(data);
    }

    console.log(plans);

    res.status(200).json({
        message: plans
    })
}

exports.createPlanType = async(req, res, next) => {
    accessLog.info(`CREATE A PLAN TYPE|${JSON.stringify(req.body)}`)
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
    accessLog.info(`ACCESS PLAN TYPE LIST | WEB ADMIN`)
    const types = await db.plantypes.findAll();

    let list = []
    for(let i=0; i<types.length; i++){
        const mobile = await db.mobile.findOne({
            where: {
                uuid: types[i].mobileId
            }
        })

        console.log(mobile)

        let data = {
            operator_code: types[i].operator_code,
            type: types[i].type,
            operator: types[i].operator,
            mobileId: mobile.name
        }

        list.push(data)
    }

    console.log(list)

    res.status(200).json({
        message: list
    })
}