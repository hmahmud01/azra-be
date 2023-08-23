const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require('sequelize')

exports.addCreditInfo = async(req, res, next) => {
    let data = req.body

    const creditInfo = await db.usercredit.create({
        userId: data.userId,
        credit: data.credit,
        credit_limit: data.credit_limit,
        max_credit: data.max_credit
    })

    res.json({
        status: "Success"
    })
}