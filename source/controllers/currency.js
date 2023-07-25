const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.addCurrency = async(req, res, next) => {
    let data = {
        countryId: req.body.countryId,
        aedConversionValue: req.body.aedConversionValue,
        nationalCurrency: req.body.nationalCurrency,
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
    const data = req.body.countryId

    const currency = await db.currency.findOne({
        where: {
            countryId: data
        }
    })

    res.json({
        message: currency
    })
}