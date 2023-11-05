const db = require("../models");
const Country = db.country;
const Op = db.Sequelize.Op;

exports.getCountries = async(req, res) => {
    const countries = await Country.findAll();
    return res.json({
        message: countries
    })
}

exports.listCountry = async(req, res) => {
    const countries = await Country.findAll();
    return res.json({
        message: countries
    })
}

exports.getCountry = async(req, res)=> {
    let id = req.params.id;
    const country = await Country.findOne({ where: { uuid: id } });
    return res.json({
        message: country
    })
}

exports.addCountry = async(req, res) => {
    let name = req.body.name
    let short = req.body.short
    let code = req.body.code
    let data = {
        name: name,
        short: short,
        code: code
    }

    const country = await Country.create(data)

    res.json({
        message: country
    })
}