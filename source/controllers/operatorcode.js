const { Sequelize } = require("sequelize")
const db = require("../models")

exports.setOperatorCode = async(req, res, next) => {
    let data = {
        apiProviderId : req.body.apiProviderId,
        countryId: req.body.countryId,
        mobileId: req.body.mobileId,
        operatorShort: req.body.operatorShort,
        operatorCode: req.body.operatorCode
    }

    const code = await db.operatorCode.create(data);

    res.status(200).json({
        message: `added data: ${code}`
    })
}

exports.operatorCodeList = async(req, res, next) => {
    const operatorcodelist = await db.operatorCode.findAll()

    res.status(200).json(operatorcodelist)
}