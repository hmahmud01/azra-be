const fetch = require("node-fetch-commonjs");
const db = require("../models");

const rechargeModule = require("./recharge");
const calculator = require("./userprofilecalculator");

exports.userDashboard = async(req, res, next) => {
    let reqData = {"username":"iftay","from_date":"2023-8-2","to_date":"2023-8-2"}

    const portalBalance = await rechargeModule.userPortalBalance(req.body.username)
    const earn = await calculator.calculateEarning(req.body.username);
    const sales = await calculator.calculateSale(req.body.username);
    const transfer = await calculator.calculateBalance(req.body.username);
    let data = {
        portal_balance: portalBalance.toString(),
        credit_total: "5060.0",
        no_of_sales: 0,
        total_sales: sales.sale.toString(),
        total_commission: earn.earn.toString(),
        total_credited: "0",
        total_paid: "0",
        total_transferred: transfer.received.toString(),
        total_received: transfer.transfer.toString(),
        credit_recharge_total: transfer.balance.toString(),
        credit_limit: "5000.00000"
    }

    res.json(data)
}

exports.walletHistory = async(req, res, next) => {
    let reqData = {"username":"iftay","from_date":"N/A","to_date":"N/A"}

    let balance_info = []
    const user = await db.user.findOne({
        where: {
            phone: req.body.username
        }
    })

    const trx = await db.agenttransaction.findAll({
        where: {
            userId: user.uuid
        }
    })

    for (let i = 0; i<trx.length; i++){
        let paid_amount = 0
        if(trx[i].transferedAmount == 0){
            paid_amount = trx[i].dedcutedAmount
        }else if(trx[i].dedcutedAmount == 0){
            paid_amount = trx[i].transferedAmount
        }else {
            paid_amount = 0
        }
        let info = {
            voucher_no: `AZR 00 ${trx[i].id}`,
            voucher_date: trx[i].createdAt,
            paid_amount: paid_amount.toString()
        }

        balance_info.push(info)
    }

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

    res.json(balance_info)
}