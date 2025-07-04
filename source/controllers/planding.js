const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

const { accessLog } = require("../authsrc/middlewares")

exports.createdingplan = async(req, res, next) => {
    accessLog.info(`CREATE A DING PLAN | ${JSON.stringify(req.body)} | WEB ADMIN`)
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

    const ding = await db.planding.create(data)

    res.status(200).json({
        msg: `DING PLAN ADDED : ${ding.uuid}`
    })

}

exports.listdingplan = async(req, res, next) => {
    accessLog.info(`ACCESS DING PLAN LIST | WEB ADMIN`)
    const dingplans = await db.planding.findAll()

    let ding = []

    for(let i=0; i<dingplans.length; i++){
        const plan = await db.plans.findOne({
            where: {
                uuid: dingplans[i].plan_id
            }
        })

        if(plan) {
            let data = {
                country: dingplans[i].country,
                operator: dingplans[i].operator,
                plan_id: plan.narration,
                providercode: dingplans[i].providercode,
                receive_amount: dingplans[i].receive_amount,
                receive_currency: dingplans[i].receive_currency,
                send_amount: dingplans[i].send_amount,
                send_currency: dingplans[i].send_currency,
                skucode: dingplans[i].skucode,
                type: dingplans[i].type,
            }
    
            ding.push(data)
        }else {
            let data = {
                country: dingplans[i].country,
                operator: dingplans[i].operator,
                plan_id: "No-plan",
                providercode: dingplans[i].providercode,
                receive_amount: dingplans[i].receive_amount,
                receive_currency: dingplans[i].receive_currency,
                send_amount: dingplans[i].send_amount,
                send_currency: dingplans[i].send_currency,
                skucode: dingplans[i].skucode,
                type: dingplans[i].type,
            }
    
            ding.push(data)
        }

        
    }

    console.log(ding)

    res.status(200).json(ding)
}