const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");
const fetch = require("node-fetch-commonjs");
const qs = require('qs');
const axios = require('axios');

const rechargeModule = require('./recharge_module');

exports.plans = async(req, res, next) => {
    let service_code = req.body.service_code
    let country_code = req.body.country_code
    let circle_code = req.body.circle_code
    let operator_code = req.body.operator_code
    let username = req.body.username
    let ui_number = req.body.ui_number

    console.log("REQUEST BODY")
    console.log(req.body)

    const grp = []

    const groups = await db.plantypes.findAll({
        where: {
            operator_code: {
                [Op.startsWith]: operator_code
            }
        }
    })

    console.log("PRINTING GROUPS")
    console.log(groups)

    for (let i=0; i<groups.length; i++){
        console.log("GROUP OPERATAOR CODE")
        console.log(groups[i].operator_code)
        const plandata = await db.plans.findAll({
            where: {
                operator_code: groups[i].operator_code,
                circle_code: circle_code
            }
        })
        console.log("PLAN DATA FILTERED")
        console.log(plandata)
        let plans = []
        for(let j=0; j<plandata.length; j++){
            let data = {
                plan_id: plandata[j].uuid,
                operator_code: plandata[j].operator_code,
                circle_code: plandata[j].circle_code,
                credit_amount: plandata[j].credit_amount,
                credit_currency: plandata[j].credit_currency,
                debit_amount: plandata[j].debit_amount,
                debit_currency: plandata[j].debit_currency,
                validity: plandata[j].validity,
                narration: plandata[j].narration,
                is_range: plandata[j].is_range,
                api_plan_id: plandata[j].api_plan_id,
                tags: []
            }
            plans.push(data)
        }

        let grpdata = {
            type: groups[i].type,
            operator_code: groups[i].operator_code,
            plans: plans
        }
        grp.push(grpdata)
    }

    let finalData = {
        exchange_rate: "",
        groups: grp
    }

    res.json(finalData)
}

exports.operators = async(req, res, next) => {
    let data = {"country_code":"BD","service_code":"MR"}

    let country_code = req.body.country_code
    let service_code = req.body.service_code

    let operators = []
    let circles = []

    const country = await db.country.findOne({
        where: {
            short: country_code
        }
    })

    console.log(country)

    const circlelist = await db.circle.findAll({
        where: {
            code: country_code
        }
    })

    for(let i = 0; i<circlelist.length; i++){
        let circle = {
            circle_name: circlelist[i].name,
            circle_code: circlelist[i].code
        }
        circles.push(circle)
    }

    

    const operatorCodes = await db.operatorCode.findAll({
        where: {
            countryId: country.uuid
        }
    })

    console.log(operatorCodes)
    
    for(let i=0; i<operatorCodes.length; i++){
        const operator = await db.mobile.findOne({
            where: {
                uuid: operatorCodes[i].mobileId
            }
        })

        console.log(operator.name)
        console.log(operatorCodes[i])

        let operatorData= {
            operator_name: operator.name,
		    operator_code: operatorCodes[i].operatorCode
        }

        operators.push(operatorData)
    }

    res.status(200).json({
        operators: operators,
        circles: circles
    })

}

exports.operatorCheck = async(req, res, next) => {

    let service_code = req.body.service_code
    let country_code = req.body.country_code
    let ui_number = req.body.ui_number
    let prefix = req.body.prefix

    let mobId= ""
    let setting = {}

    const operatorsetting = await db.mobilesetting.findAll({
        where: {
            serviceCode: service_code,
            callingCode: prefix,
        }
    })

    for (let i=0; i<operatorsetting.length; i++){
        if (ui_number.startsWith(operatorsetting[i].startsWith)){
            mobId = operatorsetting[i].mobileId
            setting = operatorsetting[i]
            break
        }
    }

    const operatorCode = await db.operatorCode.findOne({
        where: {
            mobileId: mobId
        }
    })

    const country = await db.country.findOne({
        where: {
            uuid: operatorCode.countryId
        }
    })

    var res_data = {
        operator_code: operatorCode.operatorCode,
        circle_code: country.short
    }

    res.json(res_data)
}

exports.BalanceTransfer = async(req, res, next) => {
    let customer = req.body.username_customer
    let amount = req.body.amount
    let narration = req.body.narration

    const user = await db.user.findOne({
        where: {
            phone: customer
        }
    })

    const transfer = await db.agenttransaction.create({
        userId: user.uuid,
        transferedAmount: parseFloat(amount),
        dedcutedAmount: 0.00
    })

    const settlement = await db.useramountsettlement.create({
        userId: user.uuid,
        debit: 0.00,
        credit: parseFloat(amount),
        note: narration
    })

    const logsms = `Amount ${amount} has been transferred to ${customer}'s account`
    const syslog = await db.systemlog.create({
        type: "Transfer",
        detail: logsms
    })

    res.status(200).json({
        message: "transfer Done",
        data: transfer
    })
}

exports.userPortalBalance = async(username) => {
    let mainBalance = 0.00;
    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })

    const agentTrx = await db.agenttransaction.findAll({
        where: {
            userId: user.uuid
        }
    })

    for (let i = 0; i < agentTrx.length; i++) {
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].dedcutedAmount
    }

    console.log(`main balance from trasaction calculation , ${mainBalance}`)
    const lockedbalances = await db.lockedbalance.findAll({
        where: {
            lockedStatus: true,
            userId: user.uuid
        }
    })

    let pendingRecharge = 0.00

    for (let i = 0; i < lockedbalances.length; i++) {
        pendingRecharge += lockedbalances[i].amountLocked
    }

    console.log(`Pending Balance: ${pendingRecharge}`);
    let actualbalance = mainBalance - pendingRecharge

    return actualbalance
}

exports.userGetPortalBalance = async(req, res, next) => {
    let username = req.body.username
    // let mainBalance = 0.00;
    // const user = await db.user.findOne({
    //     where: {
    //         phone: username
    //     }
    // })

    // const agentTrx = await db.agenttransaction.findAll({
    //     where: {
    //         userId: user.uuid
    //     }
    // })

    // for (let i = 0; i < agentTrx.length; i++) {
    //     mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].dedcutedAmount
    // }

    // console.log(`main balance from trasaction calculation , ${mainBalance}`)
    // const lockedbalances = await db.lockedbalance.findAll({
    //     where: {
    //         lockedStatus: true,
    //         userId: user.uuid
    //     }
    // })

    // let pendingRecharge = 0.00

    // for (let i = 0; i < lockedbalances.length; i++) {
    //     pendingRecharge += lockedbalances[i].amountLocked
    // }

    // console.log(`Pending Balance: ${pendingRecharge}`);
    // let actualbalance = mainBalance - pendingRecharge

    const actualbalance = await this.userPortalBalance(username)
    console.log(actualbalance);

    res.status(200).json({
        message: "portal balance request",
        data: username,
        balance: actualbalance
    })
}

exports.confirmRecharge = async(req, res, next) => {

    let username = req.body.username
    let plan_amount = req.body.plan_amount
    let plan_id = req.body.plan_id
    let response = {}

    let debit_amount = 0.0

    const plan = await db.plans.findOne({
        where: {
            uuid: plan_id
        }
    })

    if (plan.is_range){
        const currency = await db.currency.findOne({
            where: {
                credit_currency: plan.credit_currency,
                debit_currency: plan.debit_currency
            }
        })

        debit_amount = (parseInt(plan_amount) * currency.conversionValue).toFixed(2);

    }else{
        debit_amount = plan.debit_amount
    }

    let send_data = {
        "username" : username
    }

    console.log(send_data)

    let mainBalance = 0.00;
    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })

    const agentTrx = await db.agenttransaction.findAll({
        where: {
            userId: user.uuid
        }
    })

    for (let i = 0; i < agentTrx.length; i++) {
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].dedcutedAmount
    }

    console.log(`main balance from trasaction calculation , ${mainBalance}`)
    const lockedbalances = await db.lockedbalance.findAll({
        where: {
            lockedStatus: true,
            userId: user.uuid
        }
    })

    let pendingRecharge = 0.00

    for (let i = 0; i < lockedbalances.length; i++) {
        pendingRecharge += lockedbalances[i].amountLocked
    }

    console.log(`Pending Balance: ${pendingRecharge}`);
    let actualbalance = mainBalance - pendingRecharge

    if(actualbalance > debit_amount) {
        response = {
            status: "success",
            message: [{
                description: "Request Processing",
                code: 200
            }],
            debit_amount: debit_amount
        }
    }else{
        response = {
            status: "failed",
            message: [{
                description: "Not Enough Balance",
                code: 200
            }],
            debit_amount: debit_amount
        }
    }

    res.json(response)

}

const saveResponse = async (response, trxId) => {
    const trxResp = await db.transactionresponse.create({
        transactionId: trxId,
        status: true,
        response: response
    })

    console.log("TRX RESPONSE: ", trxResp);

    return trxResp;
}

const saleReport = async(data) => {
    // utilize reportsalesModel.model.js
    const plan = ""
    const agent = ""
    const api = ""
    const profit = ""
    const sale = await db.sales.create({
        balance: 1000.0,
        amount: 250.66,
        agent: "agent",
        number: "016565654654",
        operator: "GP",
        api: "LIVE",
        profit: 95.416
    })

    return sale.uuid;
}


exports.recharge = async(req, res, next) => {
    let data = {
        username: req.body.username,
        sub_operator_code: req.body.sub_operator_code,
        country_code: req.body.country_code,
        service_code: req.body.service_code,
        ui_number: req.body.ui_number,
        plan_amount: req.body.plan_amount,
        plan_id: req.body.plan_id,
        circle_code: req.body.circle_code,
        prefix: req.body.prefix
    }

    console.log("DATA")
    console.log(data)

    var now = new Date();
    // now.format("dd/MM/yyyy hh:mm TT");

    const userbalance = await this.userPortalBalance(data.username);

    let debit_amount = 0.0
    let credit_amount = 0.0

    let apiResp = {
        status: "failed",
        message: [{
            description: "Error Occured",
            code: 200
        }]
    }
    let mobile = data.prefix + data.ui_number

    const ip_addr = req.socket.remoteAddress;
    const device = req.headers['user-agent']

    // FLAGS FOR TRX AND STATUS DATA
    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    const user = await db.user.findOne({
        where: {
            phone: data.username
        }
    })

    const lockedNumber = await db.lockednumber.findAll({
        where:{
            phone: mobile,
            status: true
        }
    })

    const plan = await db.plans.findOne({
        where: {
            uuid: req.body.plan_id
        }
    })

    const plan_type = await db.plantypes.findOne({
        where: {
            operator_code: data.sub_operator_code
        }
    })
    console.log(data.sub_operator_code)
    console.log("PLAN TYPES")
    console.log(plan_type)

    const network = await db.mobile.findOne({
        where: {
            uuid: plan_type.mobileId
        }
    })

    const api = await db.api.findOne({
        where: {
            uuid: plan.api_plan_id
        }
    })

    if (plan.is_range){
        const currency = await db.currency.findOne({
            where: {
                credit_currency: plan.credit_currency,
                debit_currency: plan.debit_currency
            }
        })

        debit_amount = (parseInt(data.plan_amount) * currency.conversionValue).toFixed(2);
        
    }else{
        debit_amount = plan.debit_amount
    }

    if (lockedNumber.length > 0){
        let msg = `This number is already engaged with a pending recharge : ${mobile}`;
        console.log(msg)
        console.log(lockedNumber)
        // res.status(200).json({
        //     apiResp: msg
        // })
        apiResp = {
            status: "failed",
            balance: userbalance,
            api_trans_code: api.id,
            message: [{
                "description": "Transaction was unsuccessfull, Number Is busy for another trx",
                "code": "200",
            }],
            trans_id: null,
            trans_code: null,
            trans_date: null,
            request_endtime: null
        }
    } else {
        let transaction_data = {
            phone: mobile,
            amount: parseFloat(plan.credit_amount),
            agent: data.username,
            userId: user.uuid,
            rechargeStatus: true,
            countryId: network.countryId,
            mobileId: network.uuid,
            serviceId: req.body.service_code,
            planId: data.plan_id
        }

        const transaction = await db.transaction.create(transaction_data)

        const trxSource = await db.transactionsource.create({
            ip_addr: ip_addr,
            device: device,
            transactionId: transaction.uuid
        })

        const transfer = await db.agenttransaction.create({
            userId: user.uuid,
            transferedAmount: 0.00,
            dedcutedAmount: debit_amount,
            transactionId: transaction.uuid
        })

        const lockedBalance = await db.lockedbalance.create({
            userId: user.uuid,
            currentBalance: 0.00,
            amountLocked: debit_amount,
            lockedStatus: true
        })

        const lockedNumber = await db.lockednumber.create({
            phone: mobile,
            status: true,
            trx_id: transaction.uuid
        })

        let balanceData = {
            username: data.username,
            plan_amount: data.plan_amount,
            plan_id: data.plan_id
        }

        const balance = {
            balance: 12.0
        }

        console.log(balance);

        console.log("TRANSACATION BUILT > BALANCE LOCKED > NUMBER LOCKED");

        if(api.code == "LIV"){
            // const apiResp = await rechargeModule.rechargeLive({plan, data, plan_type, network, api, transaction});
            console.log("inside LIVE API")
            const apiurl = process.env.LIV
            const apikey = process.env.LIV_APIKEY
            const client_id = process.env.LIV_CLIENT_ID
            const transaction_id = '00' + transaction.id
            const msisdn = mobile
            const sendAmount = plan.credit_amount
            let operator = ""

            if (network.name == "Grameenphone"){
                operator = "grameen"
            }else if (network.name == "Banglalink"){
                operator = "banglalink"
            }else if (network.name == "Airtel"){
                operator = "airtel"
            }else if (network.name == "Robi"){
                operator = "robi"
            }

            const send_data = {
                "data": {
                    "msisdn": msisdn,
                    "amount": parseInt(req.body.plan_amount),
                    "transaction_id": transaction_id,
                    "client_id": client_id,
                    "operator": operator
                }
            }

            console.log(`MSISDN : ${msisdn}`)
            console.log(`RECHARGE AMOUNT : ${parseInt(req.body.plan_amount)}`)
            const apiCall = await fetch(apiurl, {
                method: 'POST',
                headers: {
                    'x-api-key' : apikey,
                    'Content-Type': 'application/json'  
                },
                body: JSON.stringify(send_data),
            })
            .then(response => response.json())
            .then(async data => {
                console.log("data from live : ", data)
                const resp = await saveResponse(data, transaction.id);
                console.log(resp);
                if (data.status == "success"){
                    trx_data = {
                        transactionId: transaction.uuid,
                        apiId: api.uuid
                    }
                    trx_api_id = api.uuid
                    trx_status = true
                }
            }) 
            .catch(e => {
                console.log(e);
                console.log("LIVE DIDNT WORK");
            }) 


            // DUMMY RESPONSE
            // trx_status = true
            // trx_api_id = api.uuid
            // trx_data = {
            //     transactionId: transaction.uuid,
            //     apiId: api.uuid
            // }
            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);
            
            if (trx_status) {
                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })

                const apitrx = await db.apitransaction.create(trx_data)

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                        api_trx_id: apitrx.uuid
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )

                const record = await db.transactionrecordapi.create({
                    apiTransactionId: apitrx.uuid,
                    status: true,
                    statement: "Successfully recharged"
                })
                console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
                console.log("Add a entry of success recharge balance and adjust the agents real balance");

                // TODO
                // GET AGENT CUT FROM AGENTPERCENTAGE TABLE
                const percent = await db.agentpercentage.findOne({
                    where: {
                        userId: user.uuid,
                    }
                })

                console.log("Agent Percentage : ", percent.percentage);

                let earned = debit_amount / 100 * percent.percentage

                const earnedData = {
                    userId: user.uuid,
                    amount: earned,
                    trxId: transaction.uuid
                }

                const agentEarning = await db.agentearning.create(earnedData)

                console.log("Agent Earned : ", agentEarning);

                // CREATE ENTRY ON AGENTEARNING TABLE
                // GET API PERCENTAGE FROM APIPERCENT TABLE
                // const orgPercent = 2.0

                const orgPercent = await db.apipercent.findOne({
                    where: {
                        apiId: trx_api_id,
                        mobileId: network.uuid
                    }
                })

                console.log("Organization Percent : ", orgPercent);
                let perc = 0.0
                if (orgPercent == null){
                    perc = 0.1
                }else{
                    perc = orgPercent.percent
                }

                let orgCut = debit_amount / 100 * perc
                const orgEarnedData = {
                    transactionId: transaction.uuid,
                    apiId: trx_api_id,
                    cutAmount: orgCut
                }
                const orgEarning = await db.organizationearned.create(orgEarnedData)
                console.log("Organization earning : ", orgEarning);
                apiResp = {
                    status: "success",
                    balance: (userbalance - debit_amount),
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction successfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            } else {
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })
                const upd_transaction = await db.transaction.update(
                    {
                        rechargeStatus: false
                    },
                    {
                        where: {
                            id: transaction.id,
                        }
                })

                const transfer = await db.agenttransaction.create({
                    userId: user.uuid,
                    transferedAmount: debit_amount,
                    dedcutedAmount: 0.00,
                    transactionId: transaction.uuid
                })

                console.log("transaction returned");

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                        trx_id: transaction.uuid
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )
                console.log("RETURN TRASACTION CREATED > NUMBER UNLOCKED > BALANCE RETURNED")
                console.log("Balance Unavailable");

                apiResp = {
                    status: "failed",
                    balance: userbalance,
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction was unsuccessfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            }
        }else if(api.code == "RDY"){
            console.log("=========\nRDY CONNECTE\n===========");

            const apiUrl = "https://www.rechargedaddy.in/RDRechargeAPI/RechargeAPI.aspx"
            const checkUrl = "https://www.rechargedaddy.in/RDRechargeAPI/RechargeAPI.aspx"
            let refno = "RDY - " + transaction.uuid
            // let respData = {
            //     "MobileNo": "9947539329",
            //     "APIKey": "Ye8AfUFGIgicYRTqKHFaHe2f1duYrEz4gHq",
            //     "REQTYPE": "RECH",
            //     "REFNO": refno,
            //     "SERCODE": "VF",
            //     "CUSTNO": data.ui_number,
            //     "AMT": parseInt(data.plan_amount),
            //     "STV": 0,
            //     "RESPTYPE": "JSON"

            // }
            let sercode = ""

            if (network.name == "Airtel"){
                sercode = "AR"
            }else if(network.name == "BSNL") {
                sercode = "BS"
            }else if(network.name == "Vodafone") {
                sercode = "VF"
            }else if(network.name == "Idea") {
                sercode = "ID"
            }

            let resData = qs.stringify({
                "MobileNo": "9947539329",
                "APIKey": "Ye8AfUFGIgicYRTqKHFaHe2f1duYrEz4gHq",
                "REQTYPE": "RECH",
                "REFNO": refno,
                "SERCODE": sercode,
                "CUSTNO": data.ui_number,
                "AMT": parseInt(data.plan_amount),
                "STV": 0,
                "RESPTYPE": "JSON"
            })

            // var formBody = [];
            // for (var property in respData) {
            //     var encodedKey = encodeURIComponent(property);
            //     var encodedValue = encodeURIComponent(respData[property]);
            //     formBody.push(encodedKey + "=" + encodedValue);
            // }
            // formBody = formBody.join("&");

            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: apiUrl,
                headers: { 
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data : resData
            };

            // const apiCall = await fetch(apiUrl, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     },
            //     body: resData
            // })
            await axios.request(config)
            // .then(response => response.json())
            .then(async ({data}) => {
                console.log("API HIT DONE. CHECKING TRX")
                console.log(data);
                let checkData = qs.stringify({
                    "MobileNo": "9947539329",
                    "APIKey": "Ye8AfUFGIgicYRTqKHFaHe2f1duYrEz4gHq",
                    "REQTYPE": "STATUS",
                    "REFNO": refno,
                    "RESPTYPE": "JSON"
                })

                let config2 = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: checkUrl,
                    headers: { 
                      'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data : checkData
                };

                // var formData = [];
                // for (var property in checkData) {
                //     var encodedKey = encodeURIComponent(property);
                //     var encodedValue = encodeURIComponent(checkData[property]);
                //     formData.push(encodedKey + "=" + encodedValue);
                // }
                // formData = formData.join("&");

                // const trxCheck = await fetch(checkUrl, {
                //     method: 'GET',
                //     headers: {
                //         'Content-Type': 'application/x-www-form-urlencoded'
                //     },
                //     body: checkData
                // })
                await axios.request(config2)
                // .then(response => response.json())
                .then(async ({data}) => {
                    console.log(data);
                    // {"STATUSCODE":"0","STATUSMSG":"Success","REFNO":"02RDYU2906","TRNID":28099563,"TRNSTATUS":1,"TRNSTATUSDESC":"Success","OPRID":"MHR2305291527260020"}
                    const respMsg = `StatusCode: ${data.STATUSCODE}, StatusMSG: ${data.STATUSMSG} , REFNO: ${data.REFNO} , TRNID: ${data.TRNID} , TRNSTATUS : ${data.TRNSTATUS} , OPRID : ${data.OPRID}`
                    const resp = await saveResponse(respMsg, data.TRNID)
                    if(data.STATUSMSG == "Success"){
                        trx_data = {
                            transactionId: transaction.uuid,
                            apiId: api.uuid
                        }
                        trx_api_id = api.uuid
                        trx_status = true
                    }
                })
                .catch(e=> {
                    console.log(e)
                    console.log("RDY didnt work")
                })
            })
            // DUMMY RESPONSE
            // trx_status = true
            // trx_api_id = api.uuid
            // trx_data = {
            //     transactionId: transaction.uuid,
            //     apiId: api.uuid
            // }
            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);
            
            if (trx_status) {
                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })

                const apitrx = await db.apitransaction.create(trx_data)

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                        api_trx_id: apitrx.uuid
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )

                const record = await db.transactionrecordapi.create({
                    apiTransactionId: apitrx.uuid,
                    status: true,
                    statement: "Successfully recharged"
                })
                console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
                console.log("Add a entry of success recharge balance and adjust the agents real balance");

                // TODO
                // GET AGENT CUT FROM AGENTPERCENTAGE TABLE
                const percent = await db.agentpercentage.findOne({
                    where: {
                        userId: user.uuid,
                    }
                })

                console.log("Agent Percentage : ", percent.percentage);

                let earned = debit_amount / 100 * percent.percentage

                const earnedData = {
                    userId: user.uuid,
                    amount: earned,
                    trxId: transaction.uuid
                }

                const agentEarning = await db.agentearning.create(earnedData)

                console.log("Agent Earned : ", agentEarning);

                // CREATE ENTRY ON AGENTEARNING TABLE
                // GET API PERCENTAGE FROM APIPERCENT TABLE
                // const orgPercent = 2.0

                const orgPercent = await db.apipercent.findOne({
                    where: {
                        apiId: trx_api_id,
                        mobileId: network.uuid
                    }
                })

                console.log("Organization Percent : ", orgPercent);
                let perc = 0.0
                if (orgPercent == null){
                    perc = 0.1
                }else{
                    perc = orgPercent.percent
                }

                let orgCut = debit_amount / 100 * perc
                const orgEarnedData = {
                    transactionId: transaction.uuid,
                    apiId: trx_api_id,
                    cutAmount: orgCut
                }
                const orgEarning = await db.organizationearned.create(orgEarnedData)
                console.log("Organization earning : ", orgEarning);
                apiResp = {
                    status: "success",
                    balance: (userbalance - debit_amount),
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction successfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            } else {
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })
                const upd_transaction = await db.transaction.update(
                    {
                        rechargeStatus: false
                    },
                    {
                        where: {
                            id: transaction.id,
                        }
                })

                const transfer = await db.agenttransaction.create({
                    userId: user.uuid,
                    transferedAmount: debit_amount,
                    dedcutedAmount: 0.00,
                    transactionId: transaction.uuid
                })

                console.log("transaction returned");

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                        trx_id: transaction.uuid
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )
                console.log("RETURN TRASACTION CREATED > NUMBER UNLOCKED > BALANCE RETURNED")
                console.log("Balance Unavailable");

                apiResp = {
                    status: "failed",
                    balance: userbalance,
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction was unsuccessfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            }
        }else if(api.code == "EZL"){
            console.log("=========\nEZL CONNECTE\n===========");

            const apiUrl = "https://payments-central.com/api/User/Transaction"
            const checkUrl = "https://payments-central.com/api/User/TransactionCheck"

            const phonenumber = data.prefix + data.ui_number
            
            // phonenumber can be with prefix or not
            const send_data ={
                "SessionId":"aaead679d0aa42acbc43a62a154279a2",
                "ServiceId":3,
                "Input":{
                    "Amount": parseInt(req.body.plan_amount),
                    "PhoneNumber": phonenumber
                },
                "Reference": "EZL-" + transaction.uuid
            }

            const apiCall = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(send_data)
            })
            .then(response => response.json())
            .then(async data => {
                let trxId = data.TransactionId
                let trxcheck = {
                    SessionId:"aaead679d0aa42acbc43a62a154279a2",
                    TransactionId: trxId
                }
                const checkTrx = await fetch(checkUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(trxcheck)
                })
                .then(response => response.json())
                .then(async data => {
                    console.log(data)
                    let trxMsg = `TransactionStatusCode : ${data.TransactionStatusCode} , TransactionStatusName : ${data.TransactionStatusName} , Message: ${data.Message}`
                    const resp = await saveResponse(trxMsg, trxId);
                    if(data.TransactionStatusName == "Successful"){
                        trx_data = {
                            transactionId: transaction.uuid,
                            apiId: api.uuid
                        }
                        trx_api_id = api.uuid
                        trx_status = true
                    }
                })
                .catch(e => {
                    console.log(e);
                    console.log("EZL didn't work")
                })
            })
            
            // DUMMY RESPONSE
            // trx_status = true
            // trx_api_id = api.uuid
            // trx_data = {
            //     transactionId: transaction.uuid,
            //     apiId: api.uuid
            // }
            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);
            
            if (trx_status) {
                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })

                const apitrx = await db.apitransaction.create(trx_data)

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                        api_trx_id: apitrx.uuid
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )

                const record = await db.transactionrecordapi.create({
                    apiTransactionId: apitrx.uuid,
                    status: true,
                    statement: "Successfully recharged"
                })
                console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
                console.log("Add a entry of success recharge balance and adjust the agents real balance");

                // TODO
                // GET AGENT CUT FROM AGENTPERCENTAGE TABLE
                const percent = await db.agentpercentage.findOne({
                    where: {
                        userId: user.uuid,
                    }
                })

                console.log("Agent Percentage : ", percent.percentage);

                let earned = debit_amount / 100 * percent.percentage

                const earnedData = {
                    userId: user.uuid,
                    amount: earned,
                    trxId: transaction.uuid
                }

                const agentEarning = await db.agentearning.create(earnedData)

                console.log("Agent Earned : ", agentEarning);

                // CREATE ENTRY ON AGENTEARNING TABLE
                // GET API PERCENTAGE FROM APIPERCENT TABLE
                // const orgPercent = 2.0

                const orgPercent = await db.apipercent.findOne({
                    where: {
                        apiId: trx_api_id,
                        mobileId: network.uuid
                    }
                })

                console.log("Organization Percent : ", orgPercent);
                let perc = 0.0
                if (orgPercent == null){
                    perc = 0.1
                }else{
                    perc = orgPercent.percent
                }

                let orgCut = debit_amount / 100 * perc
                const orgEarnedData = {
                    transactionId: transaction.uuid,
                    apiId: trx_api_id,
                    cutAmount: orgCut
                }
                const orgEarning = await db.organizationearned.create(orgEarnedData)
                console.log("Organization earning : ", orgEarning);
                apiResp = {
                    status: "success",
                    balance: (userbalance - debit_amount),
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction successfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            } else {
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })
                const upd_transaction = await db.transaction.update(
                    {
                        rechargeStatus: false
                    },
                    {
                        where: {
                            id: transaction.id,
                        }
                })

                const transfer = await db.agenttransaction.create({
                    userId: user.uuid,
                    transferedAmount: debit_amount,
                    dedcutedAmount: 0.00,
                    transactionId: transaction.uuid
                })

                console.log("transaction returned");

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                        trx_id: transaction.uuid
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )
                console.log("RETURN TRASACTION CREATED > NUMBER UNLOCKED > BALANCE RETURNED")
                console.log("Balance Unavailable");

                apiResp = {
                    status: "failed",
                    balance: userbalance,
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction was unsuccessfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            }
        }else if (api.code == "DNG"){
            console.log("inside DING API")
            const priceurl = process.env.DNG_PRICE
            const apiurl = process.env.DNG_API
            const apikey = process.env.DNG_APIKEY
            const transaction_id = transaction.uuid
            const account = data.prefix + data.ui_number
            const dingplan = await db.planding.findOne({
                where: {
                    plan_id: data.plan_id
                }
            })

            const estimate_data = [{
                SkuCode: dingplan.skucode,
                SendValue: 0,
                ReceiveCurrencyIso: dingplan.receive_currency,
                ReceiveValue: dingplan.receive_amount,
                BatchItemRef: "string"
            }]
            
            const header = {
                'api_key': apikey,
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            fetch(priceurl, {
                method: 'POST',
                headers: header,
                body: JSON.stringify(estimate_data)
            })
            .then(response => response.json())
            .then(async respdata => {
                console.log("SKU DATA CHECK SUCCESS *******************")
                console.log(respdata)
                const send_data = {
                    SkuCode: dingplan.skucode,
                    SendValue: respdata.Items[0].Price.SendValue,
                    AccountNumber: account,
                    DistributorRef: "AZRAPAY",
                    ValidateOnly: false
                }

                console.log("SEND DATA **************************************")
                console.log(send_data);

                fetch(apiurl, {
                    method: 'POST',
                    headers: header,
                    body: JSON.stringify(send_data)
                })
                .then(response => response.json())
                .then(async data => {
                    console.log("API HIT SUCCESS")
                    console.log(data)
                    let trxMsg = `Transaction Status`
                    const resp = saveResponse(trxMsg, transaction.id);
                    console.log(resp);
                    trx_data = {
                        transactionId: transaction.uuid,
                        apiId: api.uuid
                    }
                    trx_api_id = api.uuid
                    trx_status = true
                    
                })
                .catch(e => {
                    console.log(e);
                    console.log("DNG api url not working")
                })
            })
            .catch(e => {
                console.log(e);
                console.log("DNG Price check url didn't work")
            })

            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);
            
            if (trx_status) {
                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })

                const apitrx = await db.apitransaction.create(trx_data)

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                        api_trx_id: apitrx.uuid
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )

                const record = await db.transactionrecordapi.create({
                    apiTransactionId: apitrx.uuid,
                    status: true,
                    statement: "Successfully recharged"
                })
                console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
                console.log("Add a entry of success recharge balance and adjust the agents real balance");

                // TODO
                // GET AGENT CUT FROM AGENTPERCENTAGE TABLE
                const percent = await db.agentpercentage.findOne({
                    where: {
                        userId: user.uuid,
                    }
                })

                console.log("Agent Percentage : ", percent.percentage);

                let earned = debit_amount / 100 * percent.percentage

                const earnedData = {
                    userId: user.uuid,
                    amount: earned,
                    trxId: transaction.uuid
                }

                const agentEarning = await db.agentearning.create(earnedData)

                console.log("Agent Earned : ", agentEarning);

                // CREATE ENTRY ON AGENTEARNING TABLE
                // GET API PERCENTAGE FROM APIPERCENT TABLE
                // const orgPercent = 2.0

                const orgPercent = await db.apipercent.findOne({
                    where: {
                        apiId: trx_api_id,
                        mobileId: network.uuid
                    }
                })

                console.log("Organization Percent : ", orgPercent);
                let perc = 0.0
                if (orgPercent == null){
                    perc = 0.1
                }else{
                    perc = orgPercent.percent
                }

                let orgCut = debit_amount / 100 * perc
                const orgEarnedData = {
                    transactionId: transaction.uuid,
                    apiId: trx_api_id,
                    cutAmount: orgCut
                }
                const orgEarning = await db.organizationearned.create(orgEarnedData)
                console.log("Organization earning : ", orgEarning);
                console.log("********SUCCESS API RESPONSE************")
                apiResp = {
                    status: "success",
                    balance: (userbalance - debit_amount),
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction successfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            } else {
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })
                const upd_transaction = await db.transaction.update(
                    {
                        rechargeStatus: false
                    },
                    {
                        where: {
                            id: transaction.id,
                        }
                })

                const transfer = await db.agenttransaction.create({
                    userId: user.uuid,
                    transferedAmount: debit_amount,
                    dedcutedAmount: 0.00,
                    transactionId: transaction.uuid
                })

                console.log("transaction returned");

                const updateNumber = await db.lockednumber.update(
                    {
                        status: false,
                        trx_id: transaction.uuid
                    },
                    {
                        where: {
                            id: lockedNumber.id
                        }
                    }
                )

                const updateBalance = await db.lockedbalance.update(
                    {
                        lockedStatus: false,
                    },
                    {
                        where: {
                            id: lockedBalance.id
                        }
                    }
                )
                console.log("RETURN TRASACTION CREATED > NUMBER UNLOCKED > BALANCE RETURNED")
                console.log("Balance Unavailable");
                console.log("********FAILED API RESPONSE************")
                apiResp = {
                    status: "failed",
                    balance: userbalance,
                    api_trans_code: api.id,
                    message: [{
                        "description": "Transaction was unsuccessfull",
                        "code": "200",
                    }],
                    trans_id: data.sub_operator_code + transaction.id,
                    trans_code: `${api.code}-${transaction.uuid}`,
                    trans_date: now,
                    request_endtime: now
                }
            }

        }else{
            console.log("********FAILED API RESPONSE************")
            apiResp = {
                status: "failed",
                balance: userbalance,
                api_trans_code: api.id,
                message: [{
                    "description": "Transaction was unsuccessfull",
                    "code": "200",
                }],
                trans_id: data.sub_operator_code + transaction.id,
                trans_code: `${api.code}-${transaction.uuid}`,
                trans_date: now,
                request_endtime: now
            }
        }
    }
    res.json(apiResp)
}