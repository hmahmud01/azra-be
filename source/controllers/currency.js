const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.addCurrency = async(req, res, next) => {
    let data = {
        title : req.body.title,
        credit_currency: req.body.credit_currency,
        debit_currency: req.body.debit_currency,
        conversionValue: req.body.conversionValue
    }

    let currency = db.currency.create(data)

    res.json({
        message: `currency added ${currency}`
    })
}

exports.listCurrency = async(req, res, next) => {
    const currency = await db.currency.findAll();

    res.json({
        message: currency
    })
}

exports.findCurrency = async(req, res, next) => {
    const data = req.body.credit_currency

    const currency = await db.currency.findOne({
        where: {
            credit_currency: data
        }
    })

    res.json({
        message: currency
    })
}