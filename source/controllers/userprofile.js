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
    let payment_info = []
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
        let balanceinfo = {
            voucher_no: `BTC 00 ${trx[i].id}`,
            voucher_date: trx[i].createdAt,
            paid_amount: trx[i].transferedAmount.toString()
        }

        balance_info.push(balanceinfo)
        let paymentinfo = {
            voucher_no: `RVC 00 ${trx[i].id}`,
            voucher_date: trx[i].createdAt,
            paid_amount: trx[i].dedcutedAmount.toString()
        }
        payment_info.push(paymentinfo)
    }

    res.json({
        balance_info: balance_info,
        payment_info: payment_info
    })
}