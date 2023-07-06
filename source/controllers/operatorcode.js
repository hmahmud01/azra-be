const { Sequelize } = require("sequelize")
const db = require("../models")

exports.setOperatorCode = async(req, res, next) => {
    let data = {
        apiProviderId : req.body.apiproviderid,
        countryId: req.body.countryid,
        mobileId: req.body.mobileid,
        operatorShort: req.body.operatorshort,
        operatorCode: req.body.operatorcode
    }

    const code = await db.operatorCode.create(data);

    res.status(200).json({
        message: `added data: ${code}`
    })
}

