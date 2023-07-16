const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");

exports.addCurrency = async(req, res, next) => {
    let data = {
        countryId: req.body.countryId,
        aedConversionValue: req.body.value,
        nationalCurrency: req.body.nationalCurrency,
    }

    let currency = db.currency.create(data)

    res.json({
        message: `currency added ${currency}`
    })
}