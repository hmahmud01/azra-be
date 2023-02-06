import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const agentReport = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentRecharge = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentDues = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentSale = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentEarning = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

const agentBalance = async(req, res, next) => {
    let result = []
    res.status(200).json({
        message: result
    })
}

export default {agentReport, agentBalance, agentRecharge, agentDues, agentSale, agentEarning}