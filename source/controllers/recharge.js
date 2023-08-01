const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");
const fetch = require("node-fetch-commonjs");

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

    res.json({
        msg: res_data
    })
}

exports.customerBalanceTransferRequest = async(req, res, next) => {
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

exports.userGetPortalBalance = async(req, res, next) => {
    let username = req.body.username
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

    res.status(200).json({
        message: "portal balance request",
        data: username,
        balance: actualbalance
    })
}

exports.confirmRecharge = async(req, res, next) => {
    let pdata = {
        "username": "saiful837",
        "plan_amount": "50",
        "plan_id": "90"
    }

    let username = req.body.username
    let plan_amount = req.body.plan_amount
    let plan_id = req.body.plan_id
    let response = {}

    const plan = await db.plans.findOne({
        where: {
            uuid: plan_id
        }
    })

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
    let debit_amount = plan.debit_amount

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
        response: response.errorMessage
    })

    console.log("TRX RESPONSE: ", trxResp);

    return trxResp;
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

    let apiResp = {
        status: "failed",
        message: "Error Occured"
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

    if (lockedNumber.length > 0){
        let msg = `This number is already engaged with a pending recharge : ${mobile}`;
        console.log(msg)
        console.log(lockedNumber)
        res.status(200).json({
            message: msg
        })
    } else {
        let transaction_data = {
            phone: mobile,
            amount: parseFloat(plan.credit_amount),
            agent: data.username,
            userId: user.uuid,
            rechargeStatus: true,
            countryId: network.countryId,
            mobileId: network.uuid,
            serviceId: req.body.service_code
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
            dedcutedAmount: parseFloat(plan.credit_amount),
            transactionId: transaction.uuid
        })

        const lockedBalance = await db.lockedbalance.create({
            userId: user.uuid,
            currentBalance: 0.00,
            amountLocked: parseFloat(plan.debit_amount),
            lockedStatus: true
        })

        const lockedNumber = await db.lockednumber.create({
            phone: mobile,
            status: true,
            trx_id: transaction.uuid
        })

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
                    "amount": parseInt(plan.credit_amount),
                    "transaction_id": transaction_id,
                    "client_id": client_id,
                    "operator": operator
                }
            }

            console.log(`MSISDN : ${msisdn}`)
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

                let earned = plan.debit_amount / 100 * percent.percentage

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

                let orgCut = plan.debit_amount / 100 * perc
                const orgEarnedData = {
                    transactionId: transaction.uuid,
                    apiId: trx_api_id,
                    cutAmount: orgCut
                }
                const orgEarning = await db.organizationearned.create(orgEarnedData)
                console.log("Organization earning : ", orgEarning);
                // CREATE ENTRY ORGANIZATION EARNED TABLE
                apiResp = {
                    status: "Success",
                    message: trx_data
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
                    transferedAmount: parseFloat(plan.credit_amount),
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
                    status: "Failed",
                    message: trx_data
                }
            }
        }else{
            apiResp = {
                status: "Failed",
                message: "No Api Availabe"
            }
        }
    }

    var result = "success || failed"
    res.json(apiResp)
}   