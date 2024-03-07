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

exports.creditList = async(req, res, next) => {
    const credits = await db.usercredit.findAll()

    res.status(200).json(credits)
}