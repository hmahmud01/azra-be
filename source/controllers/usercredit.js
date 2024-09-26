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
    let list = []

    for(let i = 0; i<credits.length; i++){
        const profile = await db.userprofile.findOne({
            where : {
                userId: credits[i].userId
            }
        })

        console.log(profile);

        let data = {
            userId: credits[i].userId,
            name: `${profile.f_name} ${profile.l_name}`,
            credit: credits[i].credit,
            credit_limit: credits[i].credit_limit,
            max_credit: credits[i].max_credit
        }

        list.push(data)
    }

    res.status(200).json(list)
}