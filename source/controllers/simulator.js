// import fetch from "node-fetch";
// import { Prisma, PrismaClient } from '@prisma/client';
// import pkg from "crypto-js";
// const prisma = new PrismaClient();
// const { MD5 } = pkg;
const fetch = require("node-fetch-commonjs");
const db = require("../models");
const { MD5 } = require("crypto-js");

exports.asyncTest = async (req, res, next) => {
    let responseurl = "http://localhost:3000/asynchit";

    res.status(200).json({
        msg: "Response URL provided",
        url: responseurl
    });
}

exports.asyncURL = async (req, res, next) => {
    let response = "Recharge success";
    let loopData = req.body.loop
    let data = {
        status: 200,
        msg: "SUCCESS"
    }

    let failedmsg = {
        status: 500,
        msg: "FAILED"
    }

    let reuturn_data = data;
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(reuturn_data = data), 200000)
    })

    let randomRepeater = Math.floor(Math.random() * 5);
    res.status(400).json(data);
}


// TEST API FOR RECHARGE
exports.etisalatTest = async(req, res, next) => {
    const balance = 500
    const req_bal = parseInt(req.body.bal)

    let status = ""
    let message = ""

    if (req_bal > balance) {
        status = "failed"
        message = "Requested Balance is more than the API balance"
    }else {
        status = "success"
        message = "Recharge Request Success"
    }

    res.status(200).json({
        message: {
            status : status,
            msg : message
        }
    })
}

exports.zoloTest = async(req, res, next) => {
    const balance = 900

    let status = ""
    let message = ""

    if (req_bal > balance) {
        status = "failed"
        message = "Requested Balance is more than the API balance"
    }else {
        status = "success"
        message = "Recharge Request Success"
    }

    res.status(200).json({
        message: {
            status : status,
            msg: message
        }
    })
}


// ASYNC HIT EXAMPLE WITH RETRY COUNT
exports.asyncHit = async (req, res, next) => {

    console.log("asyn hit coming");

    let retry = 5;
    let respMsg = {}
    for (retry; retry > 0; retry--) {
        console.log(retry);
        let data = {
            "loop": retry
        }
        await new Promise((resolve) => {
            setTimeout(() => resolve(
                fetch('http://localhost:3000/asyncurl',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    })
                    .then(response => response.json())
                    .then(response => {
                        console.log(response);
                        if (response.msg == 'SUCCESS') {
                            respMsg = {
                                msg: "SUCCESS"
                            }
                        } else {
                            respMsg = {
                                msg: "FAILED"
                            }
                        }
                    })
            ), 30000);
        })
        console.log(`controller retry ${retry}`)
        if (respMsg.msg == "SUCCESS")
            break;
    }
    res.status(200).json(respMsg);
}


const saveResponse = async (response, trxId) => {
    const trxResp = await db.transactionresponse.create({
        transactionId: trxId,
        status: true,
        response: response
    })

    // response cannot be an array or an object

    console.log("TRX RESPONSE: ", trxResp);

    return trxResp;
}

exports.submitData = async (req, res, next) => {
    const ip_addr = req.socket.remoteAddress;
    const device = req.headers['user-agent']

    // let userId = parseInt(req.body.userId)
    let mobile = req.body.mobile
    let amount = req.body.amount
    let country = req.body.country
    let network = req.body.network
    let service = req.body.service
    let uuid = req.body.uuid

    const operator_name = await db.mobile.findOne({
        where: {
            uuid: network
        }
    })

    // FLAGS FOR TRX AND STATUS DATA
    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    // BALANCE AND PREVIOUS LOCKED BALANCE CALCULATION

    let mainBalance = 0.00;
    const agentTrx = await db.agenttransaction.findAll({
        where: {
            // userId: userId
            userId: uuid
        }
    })

    for (let i = 0; i < agentTrx.length; i++) {
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].dedcutedAmount
    }
    console.log(`main balance from trasaction calculation , ${mainBalance}`)

    const lockedbalances = await db.lockedbalance.findAll({
        where: {
            // userId: userId,
            userId: uuid,
            lockedStatus: true
        }
    })


    let pendingRecharge = 0.00

    for (let i = 0; i < lockedbalances.length; i++) {
        pendingRecharge += lockedbalances[i].amountLocked
    }

    console.log(`Pending Balance: ${pendingRecharge}`);
    let actualbalanceagent = mainBalance - pendingRecharge

    console.log(`Actual Balance ${actualbalanceagent}`);

    // BALANCE CALCULATION ENDS

    // API LISTING AND SORTED ACCORDING TO PRIORITY
    const apis = await db.apicountrypriority.findAll({
        where: {
            countryId: country
        }
    })

    let apicredunsorted = []
    for (let i = 0; i < apis.length; i++) {
        const api = await db.api.findOne({where: {uuid: apis[i].apiId}})
        if (api.status == true) {
            apicredunsorted.push(apis[i])
        }
    }

    let apicreds = apicredunsorted.sort(
        (a1, a2) => (a1.priority < a2.priority) ? 1 : (a1.priority > a2.priority) ? -1 : 0);

    // API LIST AND SORT DONE

    console.log("Enlisted Apis to work with : ", apicreds);
    console.log("Amount to be recharge for : ", amount);

    // find locked number
    const lockedNumber = await db.lockednumber.findAll({
        where: {
            phone: mobile,
            status: true
        }
    })

    console.log(`loccked status: ${lockedNumber}`)


    console.log(uuid)
    const user = await db.user.findOne({
        where: {
            uuid: uuid
        }
    })
    console.log(user)

    let userId = user.uuid

    if (lockedNumber.length > 0) {
        let msg = `This number is already engaged with a pending recharge : ${mobile}`;
        console.log(msg)
        console.log(lockedNumber)
        res.status(200).json({
            message: msg
        })
    } else {
        let transaction_data = {
            phone: mobile,
            amount: parseFloat(amount),
            agent: user.store,
            userId: userId,
            rechargeStatus: true,
            countryId: country,
            mobileId: network,
            serviceId: service
        }
        if (actualbalanceagent > amount) {
            console.log("User Id : ", uuid);

            const transaction = await db.transaction.create(transaction_data)

            const trxSource = await db.transactionsource.create({
                ip_addr: ip_addr,
                device: device,
                transactionId: transaction.uuid
            })

            const transfer = await db.agenttransaction.create({
                userId: userId,
                transferedAmount: 0.00,
                dedcutedAmount: parseFloat(amount),
                transactionId: transaction.uuid
            })

            const lockedBalance = await db.lockedbalance.create({
                userId: userId,
                currentBalance: actualbalanceagent,
                amountLocked: parseFloat(amount),
                lockedStatus: true
            })

            const lockedNumber = await db.lockednumber.create({
                phone: mobile,
                status: true,
                trx_id: transaction.uuid
            })

            console.log("TRANSACATION BUILT > BALANCE LOCKED > NUMBER LOCKED");

            for (let i = 0; i < apicreds.length; i++) {
                const api = await db.api.findOne({where: {uuid: apicreds[i].apiId}})
                if (api.code == "TST") {
                    const res = await fetch(process.env.TSTBAL);
                    const data = await res.json();

                    console.log("Available Balance for TEST : ", data.items[0].balance);
                    if (data.items[0].balance >= amount) {
                        console.log("TEST API WORKING");
                        const res = await fetch(process.env.TSTREC);
                        const response = await res.json();
                        console.log(response.items[0].message);
                        trx_data = {
                            transcationId: transaction.uuid,
                            apiId: api.uuid
                        }
                        trx_api_id = api.uuid
                        trx_status = true
                        break;
                    } else {
                        console.log("TEST API DIDN't WORK");
                    }

                } else if (api.code == "ETS") {
                    const send_data = {
                        bal : amount
                    }
                    // const res = await fetch(process.env.ETSTST)
                    const apiCall = await fetch(process.env.ETSTST, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'  
                        },
                        body: JSON.stringify(send_data),
                    })
                    const data = await apiCall.json()
                    console.log(data)
                    const resp = saveResponse(data.message, transaction.id);
                    if (data.message.status == "success"){
                        trx_data = {
                            transcationId: transaction.uuid,
                            apiId: api.uuid
                        }
                        trx_api_id = api.uuid
                        trx_status = true
                        break;
                    }else{
                        console.log("ETS DIDN'T WORK")
                    }
                    
                    // const res = await fetch(process.env.ETSBAL);
                    // const data = await res.json();

                    // console.log("Available Balance for ETS : ", data.items[0].balance);
                    // if (data.items[0].balance >= amount) {
                    //     console.log("ETS API WORKING");
                    //     const res = await fetch(process.env.ETSREC);
                    //     const response = await res.json();
                    //     console.log(response.items[0].message);
                    //     const resp = saveResponse(response.items[0].message, transaction.id);
                    //     trx_data = {
                    //         trx: {
                    //             connect: {
                    //                 id: transaction.id
                    //             }
                    //         },
                    //         api: {
                    //             connect: {
                    //                 id: apicreds[i].api.id
                    //             }
                    //         }
                    //     }
                    //     trx_api_id = apicreds[i].api.id
                    //     trx_status = true
                    //     break;
                    // } else {
                    //     console.log("ETS DIDN'T WORK")
                    // }

                } else if (api.code == "ZLO") {
                    const send_data = {
                        bal : amount
                    }
                    // const res = await fetch(process.env.ETSTST)
                    const apiCall = await fetch(process.env.ETSTST, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'  
                        },
                        body: JSON.stringify(send_data),
                    })
                    const data = await apiCall.json()
                    console.log(data)
                    const resp = saveResponse(data.message, transaction.id);
                    if (data.message.status == "success"){
                        trx_data = {
                            transcationId: transaction.uuid,
                            apiId: api.uuid
                        }
                        trx_api_id = api.uuid
                        trx_status = true
                        break;
                    }else{
                        console.log("ZLO DIDN'T WORK")
                    }

                    // const res = await fetch(process.env.ZLOBAL);
                    // const data = await res.json();

                    // console.log("Available Balance for ZOLO : ", data.items[0].balance);
                    // if (data.items[0].balance >= amount) {
                    //     console.log("ZOLO API WORKING");
                    //     const res = await fetch(process.env.ZLOREC);
                    //     const response = await res.json();
                    //     console.log(response.items[0].message);
                    //     trx_data = {
                    //         trx: {
                    //             connect: {
                    //                 id: transaction.id
                    //             }
                    //         },
                    //         api: {
                    //             connect: {
                    //                 id: apicreds[i].api.id
                    //             }
                    //         }
                    //     }
                    //     trx_api_id = apicreds[i].api.id
                    //     trx_status = true
                    //     break;
                    // } else {
                    //     console.log("ZOLO DIDN'T WORK");
                    // }
                } else if (api.code == "DU") {
                    console.log("INSIDE DU SIM");

                    let balance = 1000.00

                    console.log(`Available balance for DU Sim : ${balance}`);
                    if (balance >= amount) {
                        await fetch(process.env.DUSIM, {
                            method: 'POST'
                        })
                            .then(response => response.json())
                            .then(async response => {
                                console.log(response.url);
                                return await fetch(response.url, { method: 'POST' });
                            })
                            .then(response => response.json())
                            .then(response => {
                                console.log(response);
                                if (response.msg == 'SUCCESS') {
                                    console.log(trx_status, " before trx ");
                                    trx_data = {
                                        transcationId: transaction.uuid,
                                        apiId: api.uuid
                                    }
                                    trx_api_id = api.uuid
                                    trx_status = true
                                    console.log(trx_status, " after trx ");
                                    console.log(trx_data);
                                }
                            })
                        if (trx_status == true) {
                            break;
                        }
                    } else {
                        console.log("DU SIM API DIDNT WORK");
                    }
                } else if (api.code == "LIV") {
                    console.log("inside LIVE API")
                    const apiurl = process.env.LIV
                    const apikey = process.env.LIV_APIKEY
                    const client_id = process.env.LIV_CLIENT_ID
                    const transaction_id = '00' + transaction.id
                    const msisdn = mobile
                    if (operator_name.name == "grameen"){
                        const operator = "grameen"
                    }else{
                        const operator = operator_name.name
                    }
                        
                    const sendAmout = amount

                    const send_data = {
                        "data": {
                            "msisdn": msisdn,
                            "amount": parseInt(sendAmout),
                            "transaction_id": transaction_id,
                            "client_id": client_id,
                            "operator": operator
                        }
                    }

                    console.log("sending Data : ", send_data)

                    const apiCall = await fetch(apiurl, {
                        method: 'POST',
                        headers: {
                            'x-api-key' : apikey,
                            'Content-Type': 'application/json'  
                        },
                        body: JSON.stringify(send_data),
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log("data from live : ", data)
                        const resp = saveResponse(data, transaction.id);
                        console.log(resp);
                        trx_data = {
                            transcationId: transaction.uuid,
                            apiId: api.uuid
                        }
                        trx_api_id = api.uuid
                        trx_status = true
                    }) 
                    .catch(e => {
                        console.log(e);
                        console.log("LIVE DIDNT WORK");
                    }) 
                }
            }

            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);

            if (trx_status) {
                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${userId} for the amount ${amount}`
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
                    })

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
                        userId: uuid,
                    }
                })

                console.log("Agent Percentage : ", percent.percentage);

                let earned = amount / 100 * percent.percentage

                const earnedData = {
                    userId: uuid,
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
                        mobileId: network
                    }
                })

                console.log("Organization Percent : ", orgPercent);
                let perc = 0.0
                if (orgPercent == null){
                    perc = 0.1
                }else{
                    perc = orgPercent.percent
                }

                let orgCut = amount / 100 * perc
                const orgEarnedData = {
                    transactionId: transaction.uuid,
                    apiId: trx_api_id,
                    cutAmount: orgCut
                }
                const orgEarning = await db.organizationearned.create(orgEarnedData)
                console.log("Organization earning : ", orgEarning);
                // CREATE ENTRY ORGANIZATION EARNED TABLE

            } else {
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${userId} for the amount ${amount}`
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
                    userId: userId,
                    transferedAmount: parseFloat(amount),
                    dedcutedAmount: 0.00,
                    transcationId: transaction.uuid
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
            }
        } else {
            console.log("INSUFFICIENT AGENT BALANCE, RECHARGE FAILED !!!");
        }
    }

    if (trx_status) {
        res.status(200).json({
            message: "TRX has been completed"
        })
    }else{
        res.json({
            message: "TRX FAILED"
        })
    }

}

exports.allTransactions = async (req, res, next) => {
    const trx = await db.apitransaction.findAll();

    let result = []

    for(let i=0; i<trx.length; i++){
        const api = db.api.findOne({where: {uuid: trx[i].apiId}})
        const trx = db.transaction.findOne({where: {uuid: trx[i].transactionId}})
        let data = {
            id: trx[i].id,
            createdAt: trx[i].createdAt,
            api: api.code,
            phone: trx.phone,
            amount: trx.amount,
            agent: trx.agent
        }
        result.push(data);
    }

    res.status(200).json({
        message: result
    })
}

exports.allagentTrx = async (req, res, next) => {
    const atrx = await db.agenttransaction.findAll(
        {
            where: {
                userId: uuid
            }
        }
    )

    res.status(200).json({
        message: atrx
    })
}

exports.agentBalance = async (req, res, next) => {
    const uid = req.params.id

    let mainBalance = 0.00;
    const agentTrx = await db.agenttransaction.findAll({
        where: {
            userId: uid
        }
    })

    console.log(agentTrx)

    for (let i = 0; i < agentTrx.length; i++) {
        console.log(typeof(agentTrx[i].transferedAmount));
        console.log(typeof(agentTrx[i].dedcutedAmount), typeof(agentTrx[i].dedcutedAmount))
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].dedcutedAmount
    }
    console.log(`main balance from trasaction calculation , ${mainBalance}`)
    const lockedbalances = await db.lockedbalance.findAll({
        where: {
            lockedStatus: true,
            userId: uid
        }
    })

    let pendingRecharge = 0.00

    for (let i = 0; i < lockedbalances.length; i++) {
        pendingRecharge += lockedbalances[i].amountLocked
    }

    console.log(`Pending Balance: ${pendingRecharge}`);
    let actualbalance = mainBalance - pendingRecharge

    console.log(`Actual Balance ${actualbalance}`);
    res.status(200).json({
        balance: actualbalance
    })
}

// export default { submitData, allTransactions, agentBalance, asyncTest, asyncURL, allagentTrx, asyncHit, etisalatTest, zoloTest };