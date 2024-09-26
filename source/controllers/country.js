const db = require("../models");
const Country = db.country;
const Op = db.Sequelize.Op;

exports.getCountries = async(req, res, next) => {
    let countries = await Country.findAll();
    console.log(countries);

    return res.status(200).json({
        message: countries
    })
}

exports.listCountry = async(req, res, next) => {
    let result = await Country.findAll();

    return res.status(200).json({
        message: result
    })
}

exports.getCountry = async(req, res, next) => {
    let id = req.params.id;
    console.log(id);

    result = await Country.findOne({
        where:{
            uuid: id
        }
    });
    console.log(result);
    return res.status(200).json({
        message: result
    })
}

exports.updateCountry = async(req, res, next) => {
    return res.status(200).json({
        message: "update"
    })
}

exports.deleteCountry = async(req, res, next) => {
    let id = req.params.id;
    let msg = "Deleting id";

    return res.status(200).json({
        message: msg
    })
}

exports.addCountry = async(req, res, next) => {
    let name = req.body.name
    let short = req.body.short
    let code = req.body.code
    let data = {
        name: name,
        short: short,
        code: code
    }
    const country = await Country.create(data);
    console.log(country);
    let response = `Country Created with the Name ${country.name}`;

    return res.status(200).json({
        message: response
    })
}
