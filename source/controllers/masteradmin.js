const fetch = require("node-fetch-commonjs");
const db = require("../models");

const rechargeModule = require("./recharge");
const calculator = require("./userprofilecalculator");

const { accessLog } = require("../authsrc/middlewares");

// SUMMARIZED TILE DATA CALCULATED FUNCTIONS
exports.sales = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.transaction
    // db.sales
    console.log("LOGGIN SALES")
    let total_sales = 0.000

    const sales = await db.sales.findAll()
    for (let i = 0; i<sales.length; i++) {
        total_sales += sales[i].amount
        console.log(sales[i].amount)
    }

    res.json({
        total_sales: total_sales
    })
}

exports.collection = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.collection
    let total_collection = 0.00
    const data = await db.useramountsettlement.findAll()
    let total_debit = 0
    let total_credit = 0
    for (let i=0; i<data.length; i++){
        total_debit += data[i].debit
        total_credit += data[i].credit
    }
    res.json({
        total_collection: total_credit
    })
}

exports.earning = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.organizationearned
    // db.sales
    let earning_summary = 0.00

    const sales = await db.sales.findAll()
    for (let i = 0; i<sales.length; i++) {
        earning_summary += sales[i].profit
    }
    res.json({
        earning_summary: earning_summary
    })
}

exports.apiBalance = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.api
    // db.purchase

    let total_api_balance = 0.00
    const purchases = await db.purchase.findAll()
    for (let i = 0; i<purchases.length; i++) {
        total_api_balance += purchases[i].purchase
    }
    res.json({
        total_api_balance: total_api_balance
    })
}

exports.marketDue = async(req, res, next) => {
    let total_market_due = 0.00
    res.json({
        total_market_due: total_market_due
    })
}

exports.remainingCredit = async(req, res, next) => {
    let remaining_credit_limit = 0.00
    res.json({
        remaining_credit_limit: remaining_credit_limit
    })
}

// SUMMARIZED FUNCTION ENDS

// LISTING FUNCTION
exports.salesList = async(req, res, next) => {
    let sales_list = []
    const sales = await db.sales.findAll()
    res.json({
        sales_list : sales_list
    })
}

exports.collectionList = async(req, res, next) => {
    let collection_list = []
    const data = await db.useramountsettlement.findAll()
    res.json({
        collection_list: data
    })
}

exports.earningList = async(req, res, next) => {
    let earning_list = []
    const sales = await db.sales.findAll()
    res.json({
        earning_list: sales
    })
}

exports.apiList = async(req, res, next) => {
    let api_list = []
    const apis = await db.api.findAll()
    const apipurchase = await db.purchase.findAll()
    res.json({
        api_list: apipurchase
    })
}

exports.resellerBalanceTransferHistory = async(req, res, next) => {
    let balance_transfer_history = []
    const data = await db.useramountsettlement.findAll()
    res.json({
        balance_transfer_history: data
    })
}

// LISTING FUNCTION ENDS