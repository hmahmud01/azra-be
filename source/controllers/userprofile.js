const fetch = require("node-fetch-commonjs");
const db = require("../models");

const rechargeModule = require("./recharge");
const calculator = require("./userprofilecalculator");

// CUSTMER DASHBAORD AREA
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

exports.orderHistory = async(req, res, next) => {
    let reqdata = {"username":"iftay","from_date":"N/A","to_date":"N/A"}

    let order_history = [
        {
            "trans_id":"TRMRGNP_TOP04082023121916139984",
            "trans_code":"LIV-5S34SXP",
            "ui_number":"1768865114",
            "service_code":"MR",
            "credit_amount":"79.00000",
            "credit_currency":"BDT",
            "debit_amount":"3.59091",
            "debit_currency":"AED",
            "operator_name":"Grameenphone",
            "operator_code":"GNP",
            "country_code":"BD",
            "status":"success",
            "trans_date":"2023-08-04 12:19:20.139185",
            "deducted_amount":"3.16000",
            "commission_percent":"12.00000",
            "commission":"0.43091",
            "service_type":"Recharge",
            "sub_operator_code":"GNP_TOP",
            "sub_operator_name":"Top up",
            "operator_reference":"194730",
            "plan_description":"50-1000"
        }, 
        {
            "trans_id":"TRMRGNP_TOP01082023142026685829",
            "trans_code":"LIV-WF9165G",
            "ui_number":"1716920198",
            "service_code":"MR",
            "credit_amount":"50.00000",
            "credit_currency":"BDT",
            "debit_amount":"2.27273",
            "debit_currency":"AED",
            "operator_name":"Grameenphone",
            "operator_code":"GNP",
            "country_code":"BD",
            "status":"success",
            "trans_date":"2023-08-01 14:20:29.094669",
            "deducted_amount":"2.00000",
            "commission_percent":"12.00000",
            "commission":"0.27273",
            "service_type":"Recharge",
            "sub_operator_code":"GNP_TOP",
            "sub_operator_name":"Top up",
            "operator_reference":"194316",
            "plan_description":"50-1000"
        }
    ]

    res.json({
        order_history: order_history
    })
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

// SALES DASHBAORD AREA
exports.salesDashboard = async(req, res, next) => {
    let data = {
        "credit_balance": "11808.06000",
        "total_credited": "10000.00000",
        "total_transferred": "1350.00000",
        "no_of_sales": 100,
        "total_sales": "1097.55833",
        "total_commission": "10.17551",
        "total_paid": "0",
        "total_balance_to_pay": 1087.38282,
        "credit_total": 20849255.60281,
        "transfer_credit": 10000.0,
        "sub_reseller": {
            "total_transferred": "0",
            "no_of_sales": 32,
            "total_sales": "448.68750",
            "total_paid": "0",
            "total_commission": "2.41250",
            "total_balance_to_pay": 446.275
        },
        "credit_limit": "0.00000"
    }

    res.json(data)
}

exports.salesmanTransactionHistory = async(req, res, next) => {
    let data = {
        "transfer_info": [{
            "code": 16,
            "voucher_no": "BTC 58098",
            "customer_name": "shuaa439",
            "voucher_date": "2023-08-20 08:32:37",
            "paid_amount": "500.00000",
            "balance_amount": "500.00000",
            "narration": "#APP #N/A",
            "status": "Pending"
        }, {
            "code": 16,
            "voucher_no": "BTC 58097",
            "customer_name": "tareeq14146",
            "voucher_date": "2023-08-20 07:49:59",
            "paid_amount": "350.00000",
            "balance_amount": "350.00000",
            "narration": "#APP #N/A",
            "status": "Pending"
        }, {
            "code": 16,
            "voucher_no": "BTC 58096",
            "customer_name": "salalla",
            "voucher_date": "2023-08-20 07:48:47",
            "paid_amount": "500.00000",
            "balance_amount": "500.00000",
            "narration": "#APP #N/A",
            "status": "Pending"
        }],
        "receipt_info": [],
        "sub_reseller_transfer_info": [],
        "sub_reseller_receipt_info": [],
        "sub_customer_transfer_info": [],
        "sub_customer_receipt_info": []
    }

    res.json(data)
}

exports.getAllUsers = async(req, res, next) => {
    let data = {
        "sub_reseller_info": [{
            "full_name": "Hossain Ali Ali Ali",
            "address": "Sharjah Near Khanseeb Building",
            "contact_no": "0565687120",
            "credit_limit": "2000.00000",
            "credit_balance": "1100.00000",
            "username": "hossainali120"
        }, {
            "full_name": "Md Mijanul Hoque Hoque Hoque",
            "address": "Abu Dhabi, UAE",
            "contact_no": "0543676649",
            "credit_limit": "900000.00000",
            "credit_balance": "0.15000",
            "username": "mijanul"
        }, {
            "full_name": "AL IHSAN MOBILE RESELLER RESELLER",
            "address": "Sharjah",
            "contact_no": "0502701971",
            "credit_limit": "1000.00000",
            "credit_balance": "200.00000",
            "username": "ihsan971"
        }, {
            "full_name": "Aziz  Usman",
            "address": "784198116283791 ",
            "contact_no": "0554168654",
            "credit_limit": "0.00000",
            "credit_balance": "200.00000",
            "username": "aziz6124"
        }, {
            "full_name": "Mohammad Shohel",
            "address": "Rola, Shj",
            "contact_no": "0506081646",
            "credit_limit": "0.00000",
            "credit_balance": "0.00000",
            "username": "shohel646"
        }, {
            "full_name": "ABDUL RAHMAN Supermarket Supermarket Supermarket",
            "address": "INTERNATIONAL CITY",
            "contact_no": "0558090469",
            "credit_limit": "2000.00000",
            "credit_balance": "3.75500",
            "username": "olaalmadina"
        }, {
            "full_name": "HARUN BHAI",
            "address": "Dhira, Dubai",
            "contact_no": "0564859738",
            "credit_limit": "0.00000",
            "credit_balance": "0.00000",
            "username": "joynal738"
        }, {
            "full_name": "Omar Rahid ",
            "address": "Shj@near Maga Mall",
            "contact_no": "0567674940",
            "credit_limit": "0.00000",
            "credit_balance": "0.00000",
            "username": "rahiddxb"
        }, {
            "full_name": "Mansoor & Rahees  RAK",
            "address": "RAK",
            "contact_no": "0558455516",
            "credit_limit": "0.00000",
            "credit_balance": "0.00000",
            "username": "rakteam"
        }, {
            "full_name": "JANE ALAM ABDUL RAHMAN FREELANCER FREELANCER FREELANCER FREELANCER",
            "address": "Used Parts Area Shj@salalim Shop",
            "contact_no": "0566310655",
            "credit_limit": "6000.00000",
            "credit_balance": "1000.00000",
            "username": "alam655"
        }, {
            "full_name": "RISHU MANAYIL DXB",
            "address": "DXB AREAS",
            "contact_no": "0501509204",
            "credit_limit": "0.00000",
            "credit_balance": "0.00000",
            "username": "rishu204"
        }]
    }

    res.json(data);
}

// RESELLER DASHBOARD AREA
exports.resellerDashboard = async(req, res, next) => {
    let data = {
        "credit_balance": "11808.06000",
        "total_credited": "10000.00000",
        "total_transferred": "1350.00000",
        "no_of_sales": 100,
        "total_sales": "1097.55833",
        "total_commission": "10.17551",
        "total_paid": "0",
        "total_balance_to_pay": 1087.38282,
        "credit_total": 20849255.60281,
        "transfer_credit": 10000.0,
        "sub_reseller": {
            "total_transferred": "0",
            "no_of_sales": 32,
            "total_sales": "448.68750",
            "total_paid": "0",
            "total_commission": "2.41250",
            "total_balance_to_pay": 446.275
        },
        "credit_limit": "0.00000"
    }

    res.json(data)
}