const db = require('../models')
const { Op } = require('sequelize')
const Sequelize = require('sequelize')

const { accessLog } = require("../authsrc/middlewares")

exports.createCircle = async(req, res, next) => {
    accessLog.info(`CREATE CIRCLE | ${req.body}`)
    let data = {
        name : req.body.name,
        code: req.body.code
    }

    const circle = await db.circle.create(data)

    res.status(200).json({
        message: `circle added ${circle}`
    })
}

exports.listCircle = async(req, res, next) => {
    const circles = await db.circle.findAll()

    res.status(200).json(circles)
}