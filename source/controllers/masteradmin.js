const fetch = require("node-fetch-commonjs");
const db = require("../models");

const rechargeModule = require("./recharge");
const calculator = require("./userprofilecalculator");

const { accessLog } = require("../authsrc/middlewares");

// SUMMARIZED TILE DATA CALCULATED FUNCTIONS
exports.sales = async(req, res, next) => {
    let total_sales = 0.000
    res.json({
        total_sales: total_sales
    })
}

exports.collection = async(req, res, next) => {
    let total_collection = 0.00
    res.json({
        total_collection: total_collection
    })
}

exports.earning = async(req, res, next) => {
    let earning_summary = 0.00
    res.json({
        earning_summary: earning_summary
    })
}

exports.apiBalance = async(req, res, next) => {
    let total_api_balance = 0.00
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
    res.json({
        sales_list : sales_list
    })
}

exports.collectionList = async(req, res, next) => {
    let collection_list = []
    res.json({
        collection_list: collection_list
    })
}

exports.earningList = async(req, res, next) => {
    let earning_list = []
    res.json({
        earning_list: earning_list
    })
}

exports.apiList = async(req, res, next) => {
    let api_list = []
    res.json({
        api_list: api_list
    })
}

exports.resellerBalanceTransferHistory = async(req, res, next) => {
    let balance_transfer_history = []
    res.json({
        balance_transfer_history: balance_transfer_history
    })
}

// LISTING FUNCTION ENDS