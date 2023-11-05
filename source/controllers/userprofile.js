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

    let credit_limit = "0.0000"
    let credit_total = 0.0000
    const user = await db.user.findOne({
        where: {
            phone: req.body.username
        }
    })

    let credit = await db.usercredit.findOne({
        where: {
            userId: user.uuid
        }
    })

    if(credit != null){
        credit_limit = credit.credit_limit
    }

    const trf_history = await db.agenttransferhistory.findAll({
        where: {
            to: req.body.username
        }
    })

    if(trf_history != null){
        for(let i=0; i<trf_history.length; i++){
            credit_total += trf_history[i].amount
        }
    }
    
    let data = {
        portal_balance: portalBalance.toString(),
        credit_total: credit_total.toString(),
        no_of_sales: 0,
        total_sales: sales.sale.toString(),
        total_commission: earn.earn.toString(),
        total_credited: "0",
        total_paid: "0",
        total_transferred: transfer.received.toString(),
        total_received: transfer.transfer.toString(),
        credit_recharge_total: transfer.balance.toString(),
        credit_limit: credit_limit.toString()
    }

    res.json(data)
}

exports.orderHistory = async(req, res, next) => {
    let reqdata = {"username":"iftay","from_date":"N/A","to_date":"N/A"}
    let history = []
    const user = await db.user.findOne({
        where: {
            phone: req.body.username
        }
    })

    const userPercent = await db.agentpercentage.findOne({
        where: {
            userId: user.uuid
        }
    })

    const agnttrx = await db.agenttransaction.findAll({
        where: {
            userId: user.uuid
        }
    })

    console.log(agnttrx)


    for(let i=0; i<agnttrx.length; i++){
        console.log(`agetrsx ${i}`)
        console.log(agnttrx[i].transactionId)

        if (agnttrx[i].transactionId != null){
            console.log(agnttrx[i].transactionId)
            const trx = await db.transaction.findOne({
                where:{
                    uuid: agnttrx[i].transactionId
                }  
            })
    
            const earning = await db.agentearning.findOne({
                where: {
                    trxId: agnttrx[i].transactionId   
                }
            })
    
            const apiTrx = await db.apitransaction.findOne({
                where: {
                    transactionId: agnttrx[i].transactionId
                }
            })

            console.log("API TRX")
            console.log(apiTrx)
    
            const country = await db.country.findOne({
                where: {
                    uuid: trx.countryId
                }
            })
    
            const network = await db.mobile.findOne({
                where:{
                    uuid: trx.mobileId
                }
            })
    
            const service = await db.service.findOne({
                where: {
                    uuid: trx.serviceId
                }
            })

            console.log(service)
    
            const operatorcode = await db.operatorCode.findOne({
                where: {
                    mobileId: network.uuid
                }
            })

            const plan = await db.plans.findOne({
                where: {
                    uuid: trx.planId
                }
            })

            const planType = await db.plantypes.findOne({
                where: {
                    operator_code: plan.operator_code
                }
            })

            let earned = 0.00

            if(earning != null){
                earned = earning.amount
            }
            
            let status = "failed"

            if (trx.rechargeStatus == true){
                status = "success"
            }
            
            let data = {
                trans_id: trx.uuid,
                trans_code: trx.uuid,
                ui_number: trx.phone,
                service_code: trx.serviceId,
                credit_amount: plan.credit_amount,
                credit_currency: plan.credit_currency,
                debit_amount: plan.debit_amount,
                debit_currency: plan.debit_currency,
                operator_name: network.name,
                operator_code: operatorcode.operatorCode,
                country_code: country.short,
                status: status,
                trans_date: trx.createdAt,
                deducted_amount: agnttrx[i].dedcutedAmount.toString(),
                commission_percent: userPercent.percentage.toString(),
                commission: earned.toString(),
                service_type: plan.rechargeType,
                sub_operator_code: plan.operator_code,
                sub_operator_name: planType.type,
                operator_reference: operatorcode.id.toString(),
                plan_description: plan.narration
            }
            // console.log("USER TRX HISTORY")
            // console.log(data)
    
            history.push(data)
        }
    }

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

    console.log("USER TRX HISTORY total")
    // console.log(history)

    res.json({
        order_history: history
    })
}

exports.walletHistory = async(req, res, next) => {
    let reqData = {"username":"iftay","from_date":"N/A","to_date":"N/A"}
    const portalBalance = await rechargeModule.userPortalBalance(req.body.username)
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
    let dt = {"username":"iftaykher","from_date":"N/A","to_date":"N/A"}
    const portalBalance = await rechargeModule.userPortalBalance(req.body.username)
    let credit_limit = "0.0000"
    let credit_total = 0.0000
    const user = await db.user.findOne({
        where: {
            phone: req.body.username
        }
    })

    let credit = await db.usercredit.findOne({
        where: {
            userId: user.uuid
        }
    })

    if(credit != null){
        credit_limit = credit.credit_limit
    }

    const trf_history = await db.agenttransferhistory.findAll({
        where: {
            to: req.body.username
        }
    })

    if(trf_history != null){
        for(let i=0; i<trf_history.length; i++){
            credit_total += trf_history[i].amount
        }
    }
    
    let data = {
        "credit_balance": portalBalance.toString(),
        "total_credited": "10000.00000",
        "total_transferred": "1350.00000",
        "no_of_sales": 100,
        "total_sales": "1097.55833",
        "total_commission": "10.17551",
        "total_paid": "0",
        "total_balance_to_pay": 1087.38282,
        "credit_total": credit_total.toString(),
        "transfer_credit": 10000.0,
        "sub_reseller": {
            "total_transferred": "0",
            "no_of_sales": 32,
            "total_sales": "448.68750",
            "total_paid": "0",
            "total_commission": "2.41250",
            "total_balance_to_pay": 446.275
        },
        "credit_limit": credit_limit.toString(),
        "portal_balance": portalBalance.toString()
    }

    res.json(data)
}

exports.salesmanTransactionHistory = async(req, res, next) => {
    let dt = {"username":"iftaykher","from_date":"2023-8-20","to_date":"2023-8-20"}
    let transfer_info = []
    const trx = await db.agenttransferrequest.findAll({
        where: {
            provider_name: req.body.username
        }
    })

    for(let i=0; i<trx.length; i++){
        const userprofile = await db.userprofile.findOne({
            where: {
                phone: trx[i].customer_name
            }
        })

        const user = await db.user.findOne({
            where: {
                phone: trx[i].customer_name
            }
        })

        let name = `${userprofile.f_name} ${userprofile.l_name}`

        let data = {
            code: trx[i].id,
            voucher_no: trx[i].id,
            customer_name: name,
            voucher_date: trx[i].voucher_date,
            paid_amount: trx[i].requested_amount,
            balance_amount: trx[i].requested_amount,
            narration: trx[i].narration,
            status: trx[i].status
        }

        transfer_info.push(data)
    }


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

    res.json({
        transfer_info: transfer_info,
        receipt_info: [],
        sub_reseller_transfer_info: [],
        sub_reseller_receipt_info: [],
        sub_customer_transfer_info: [],
        sub_customer_receipt_info: []
    })
}

exports.sendBalanceToSales = async(req, res, next) => {
    const transfer = await db.agenttransferrequest.create({
        customer_name: req.body.customer_name,
        provider_name: req.body.provider_name,
        prefix: req.body.prefix,
        status: req.body.status,
        requested_amount: req.body.requested_amount,
        transfer_type: req.body.transfer_type,
        narration: req.body.narration,
        ui_voucher_date: req.body.voucher_date
    })

    // {
    //     "customer_name": "01646442321",
    //     "provider_name": "01797568609",
    //     "prefix": "BTR",
    //     "status": "Approved",
    //     "requested_amount": "1000",
    //     "transfer_type": "credit",
    //     "narration": "TRANSFER TEST",
    //     "voucher_date": "2023-08-24 11:16:02"
    // }

    const user = await db.user.findOne({
        where: {
            phone: req.body.customer_name
        }
    })

    let usertype = ""

    if(user.usertype == "agent"){
        usertype = "Customer"
    }else if(user.usertype == "subdealer"){
        usertype = "Sub Reseller"
    }else if(user.usertype == "dealer"){
        usertype = "Sales"
    }

    const trx = await db.agenttransaction.create({
        userId: user.uuid,
        transferedAmount: req.body.requested_amount,
        dedcutedAmount: 0.00
    })
    

    const settlement = await db.useramountsettlement.create({
        userId: user.uuid,
        debit: 0.00,
        credit: req.body.requested_amount,
        note: "User Credit Data"
    })

    const history = await db.agenttransferhistory.create({
        transferId: transfer.uuid,
        from: req.body.provider_name,
        to: req.body.custmer_name,
        amount: req.body.requested_amount,
        transferredToUserType: usertype
    })
    
    res.json({
        status: "success"
    })
}

exports.salesmanWalletHistory = async(req,res, next) => {
    let data = {"username":"iftaykher","from_date":"2023-8-24","to_date":"2023-8-24"}

    const user = await db.user.findOne({
        where: {
            phone: req.body.username
        }
    })

    const balance_list = await db.agenttransferrequest.findAll({
        where:{
            customer_name: req.body.username,
            status: "Approved"
        }
    })

    const payment_list = await db.agenttransferrequest.findAll({
        where:{
            provider_name: req.body.username,
            status: "Approved"
        }
    })

    let balance_info = []
    let payment_info = []

    for (let i = 0; i<balance_list.length; i++){
        let data = {
            voucher_no: `${balance_list[i].prefix} ${balance_list[i].id}`,
            voucher_date: balance_list[i].voucher_date,
            paid_amount: balance_list[i].requested_amount,
            narration: balance_list[i].narration
        }

        balance_info.push(data)
    }

    for (let i = 0; i<payment_list.length; i++){
        let data = {
            voucher_no: `${payment_list[i].prefix} ${payment_list[i].id}`,
            voucher_date: payment_list[i].voucher_date,
            paid_amount: payment_list[i].requested_amount,
            narration: payment_list[i].narration
        }

        payment_info.push(data)
    }

    let response_data = {
        balance_info: balance_info,
        payment_info: payment_info
    }

    let resp_data = {
        "balance_info": [{
            "voucher_no": "BTR 3706",
            "voucher_date": "2023-08-24 11:16:02",
            "paid_amount": "10000.00000",
            "narration": ""
        }],
        "payment_info": []
    }

    res.json(response_data)
    
}

exports.getAllUsers = async(req, res, next) => {
    let data_user = {"username_reseller":"iftaykher"}
    let sub_reseller_info = []
    let customer_info = []
    const user = await db.user.findOne({
        where:{
            phone: req.body.username_reseller
        }
    })

    const connected_users = await db.userprofile.findAll({
        where:{
            connectedUser: user.uuid
        }
    })


    for(let i=0; i<connected_users.length; i++){
        const portalBalance = await rechargeModule.userPortalBalance(connected_users[i].phone)
        const credit_info = await db.usercredit.findOne({
            where: {
                userId: connected_users[i].userId
            }
        })

        let data = {}

        if (credit_info != null){
            let data_1 = {
                full_name: `${connected_users[i].f_name} ${connected_users[i].l_name}`,
                address: connected_users[i].address,
                contact_no: connected_users[i].phone,
                credit_limit: credit_info.credit_limit.toString(),
                credit_balance: credit_info.credit.toString(),
                username: connected_users[i].phone,
                portal_balance: portalBalance.toFixed(2).toString()
            }

            data = data_1
        }else{
            let data_1 = {
                full_name: `${connected_users[i].f_name} ${connected_users[i].l_name}`,
                address: connected_users[i].address,
                contact_no: connected_users[i].phone,
                credit_limit: "0.0000",
                credit_balance: "0.0000",
                username: connected_users[i].phone,
                portal_balance: portalBalance.toFixed(2).toString()
            }
            data = data_1
        }

        if(connected_users[i].role == "subdealer"){
            sub_reseller_info.push(data)
        }else if(connected_users[i].role == "agent"){
            customer_info.push(data)
        }
    }

    let res_data = {
        sub_reseller_info: sub_reseller_info,
        customer_info: customer_info
    }

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
        }],
        "customer_info":[
            {
               "full_name":"Madinat Al Damam Grocery",
               "address":"Al Yarmook, Sharjah",
               "contact_no":"0588630503",
               "credit_limit":"2000.00000",
               "portal_balance":"2.23978",
               "username":"madinat503"
            },
            {
               "full_name":"Rubel7099",
               "address":"Shj ",
               "contact_no":"0556081647",
               "credit_limit":"1000.00000",
               "portal_balance":"2.72000",
               "username":"rubel7099"
            },
            {
               "full_name":"DAR AL HAYAH MOBILE PHONE LLC",
               "address":"Sharjah",
               "contact_no":"0523115997",
               "credit_limit":"3000.00000",
               "portal_balance":"404.83209",
               "username":"daralhayah"
            },
            {
               "full_name":"ANIS MOBILE PHONE",
               "address":"DXB DHIRA ",
               "contact_no":"0502506162",
               "credit_limit":"305.00000",
               "portal_balance":"346.96014",
               "username":"anisul"
            },
            {
               "full_name":"AL ALAMA ELECTRONIC DEVICES",
               "address":"Nasseriya",
               "contact_no":"0556405999",
               "credit_limit":"200.00000",
               "portal_balance":"1.84011",
               "username":"alalama999"
            },
            {
               "full_name":"Al WAHA Al JADEED GROCERY",
               "address":"RAK, UAE",
               "contact_no":"0501721751",
               "credit_limit":"0.00000",
               "portal_balance":"478.27353",
               "username":"waha751"
            }
        ]
    }

    res.json(res_data);
}

// RESELLER DASHBOARD AREA
exports.resellerDashboard = async(req, res, next) => {
    let dt = {"username":"iftaykher","from_date":"N/A","to_date":"N/A"}
    const portalBalance = await rechargeModule.userPortalBalance(req.body.username)
    let credit_limit = "0.0000"
    let credit_total = 0.0000
    const user = await db.user.findOne({
        where: {
            phone: req.body.username
        }
    })

    let credit = await db.usercredit.findOne({
        where: {
            userId: user.uuid
        }
    })

    if(credit != null){
        credit_limit = credit.credit_limit
    }

    const trf_history = await db.agenttransferhistory.findAll({
        where: {
            to: req.body.username
        }
    })

    if(trf_history != null){
        for(let i=0; i<trf_history.length; i++){
            credit_total += trf_history[i].amount
        }
    }

    let data = {
        "credit_balance": portalBalance.toString(),
        "total_credited": "10000.00000",
        "total_transferred": "1350.00000",
        "no_of_sales": 100,
        "total_sales": "1097.55833",
        "total_commission": "10.17551",
        "total_paid": "0",
        "total_balance_to_pay": 1087.38282,
        "credit_total": credit_total.toString(),
        "transfer_credit": 10000.0,
        "sub_reseller": {
            "total_transferred": "0",
            "no_of_sales": 32,
            "total_sales": "448.68750",
            "total_paid": "0",
            "total_commission": "2.41250",
            "total_balance_to_pay": 446.275
        },
        "credit_limit": credit_limit.toString(),
        "portal_balance": portalBalance.toString()
    }

    res.json(data)
}