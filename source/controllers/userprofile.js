const fetch = require("node-fetch-commonjs");
const db = require("../models");

exports.userDashboard = async(req, res, next) => {
    let reqData = {"username":"iftay","from_date":"2023-8-2","to_date":"2023-8-2"}
    let data = {
        portal_balance: "48.49165",
        credit_total: "5060.0",
        no_of_sales: 0,
        total_sales: "0",
        total_commission: "0",
        total_credited: "0",
        total_paid: "0",
        total_transferred: "13730.00000",
        total_received: "8670.00000",
        credit_recharge_total: "5011.508379999999",
        credit_limit: "5000.00000"
    }

    res.json(data)
}

exports.walletHistory = async(req, res, next) => {
    let reqData = {"username":"iftay","from_date":"N/A","to_date":"N/A"}
    let data = {
        balance_info: [{
            voucher_no: "BTC 56891",
            voucher_date: "2023-07-14 08:43:47",
            paid_amount: "100.00000"
        }, {
            voucher_no: "BTC 56246",
            voucher_date: "2023-06-25 23:21:31",
            paid_amount: "100.00000"
        }, {
            voucher_no: "BTC 56165",
            voucher_date: "2023-06-24 09:47:34",
            paid_amount: "100.00000"
        }]
    }

    res.json(data)
}