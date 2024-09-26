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

    let oclist = []

    for (let i=0; i<operatorcodelist.length; i++){
        const mobile = await db.mobile.findOne({
            where : {
                uuid: operatorcodelist[i].mobileId
            }
        })

        const api = await db.api.findOne({
            where: {
                uuid: operatorcodelist[i].apiProviderId
            }
        })

        const country = await db.country.findOne({
            where: {
                uuid: operatorcodelist[i].countryId
            }
        })

        let data = {
            operatorShort: operatorcodelist[i].operatorShort,
            operatorCode: operatorcodelist[i].operatorCode,
            mobile: mobile.name,
            api: api.name,
            country: country.name
        }

        oclist.push(data)
    }

    console.log(oclist);
    res.status(200).json(oclist)
}