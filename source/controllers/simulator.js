import fetch from "node-fetch";
import { Prisma, PrismaClient } from '@prisma/client';
import querystring from 'querystring';
import pkg from "crypto-js";
import { Curl, CurlHttpVersion } from "node-libcurl";
const prisma = new PrismaClient();
const { MD5 } = pkg;

// pending balance, actual balance calculation area ENDS

const liveReq = async (send_data, apiurl) => {
    console.log("qs data to send in live", querystring.stringify(send_data));
    console.log("json data to send in live", JSON.stringify(send_data));
    const curlReq = new Curl();

    const key = MD5("test@pass").toString();
    console.log("API KEY : ", key);
    const apikey = `x-api-key: `
    
    // ae0f72d3a4fccf24e4f85bdc5d017cc9
    curlReq.setOpt(Curl.option.URL, apiurl);
    curlReq.setOpt(Curl.option.TRANSFER_ENCODING, 1);
    curlReq.setOpt(Curl.option.MAXREDIRS, 2);
    curlReq.setOpt(Curl.option.SSL_VERIFYHOST, 0);
    curlReq.setOpt(Curl.option.SSL_VERIFYPEER, 0);
    curlReq.setOpt(Curl.option.TIMEOUT, 30);
    curlReq.setOpt(Curl.option.FOLLOWLOCATION, true);
    curlReq.setOpt(Curl.option.CUSTOMREQUEST, 'POST');
    curlReq.setOpt(Curl.option.POSTFIELDS, JSON.stringify(send_data))
    curlReq.setOpt(Curl.option.HTTPHEADER, [
        'x-api-key: ',
        'Content-Type: application/json'
    ])

    curlReq.on("end", function (statusCode, data, headers) {
        console.log("Status : ", statusCode);
        console.log("return Data ", data);
        saveResponse(data, send_data.data.transaction_id);
        console.log(this.getInfo("TOTAL_TIME"));
        console.log(headers);
        this.close();
    })

    curlReq.on("error", curlReq.close.bind(curlReq));
    curlReq.perform();
}


const asyncTest = async (req, res, next) => {
    let responseurl = "http://localhost:3000/asynchit";

    res.status(200).json({
        msg: "Response URL provided",
        url: responseurl
    });
}

const asyncURL = async (req, res, next) => {
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

const asyncHit = async (req, res, next) => {

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
    const trxResp = await prisma.transactionResponse.create({
        data: {
            trx: {
                connect: {
                    id: parseInt(trxId)
                }
            },
            status: true,
            response: response
        }
    })

    console.log("TRX RESPONSE: ", trxResp);

    return trxResp;
}

const submitData = async (req, res, next) => {
    const ip_addr = req.socket.remoteAddress;
    const device = req.headers['user-agent']

    // let userId = parseInt(req.body.userId)
    let mobile = req.body.mobile
    let amount = req.body.amount
    let country = req.body.country
    let network = req.body.network
    let service = req.body.service
    let uuid = req.body.uuid

    const operator_name = await prisma.mobile.findFirst({
        where: {
            id: parseInt(network)
        }
    })

    // FLAGS FOR TRX AND STATUS DATA
    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    // BALANCE AND PREVIOUS LOCKED BALANCE CALCULATION

    let mainBalance = 0.00;
    const agentTrx = await prisma.agentTransaction.findMany({
        where: {
            // userId: userId
            user: {
                uuid: uuid
            }
        }
    })

    for (let i = 0; i < agentTrx.length; i++) {
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].deductedAmount
    }
    console.log(`main balance from trasaction calculation , ${mainBalance}`)

    const lockedbalances = await prisma.lockedBalance.findMany({
        where: {
            // userId: userId,
            user: {
                uuid: uuid
            },
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
    const apis = await prisma.apiCountryPriority.findMany({
        where: {
            nationId: country
        },
        include: {
            api: true
        }
    })

    let apicredunsorted = []
    for (let i = 0; i < apis.length; i++) {
        if (apis[i].api.status == true) {
            apicredunsorted.push(apis[i])
        }
    }

    let apicreds = apicredunsorted.sort(
        (a1, a2) => (a1.priority < a2.priority) ? 1 : (a1.priority > a2.priority) ? -1 : 0);

    // API LIST AND SORT DONE

    console.log("Enlisted Apis to work with : ", apicreds);
    console.log("Amount to be recharge for : ", amount);

    // find locked number
    const lockedNumber = await prisma.lockedNumber.findMany({
        where: {
            phone: mobile,
            status: true
        }
    })

    console.log(`loccked status: ${lockedNumber}`)

    const user = await prisma.user.findFirst({
        where: {
            uuid: uuid
        }
    })

    let userId = user.id

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
            agent: "Anonymous",
            doneBy: {
                connect: {
                    id: userId
                }
            },
            rechargeStatus: true,
            country: {
                connect: {
                    id: country
                }
            },
            mobile: {
                connect: {
                    id: network
                }
            },
            service: {
                connect: {
                    id: service
                }
            }
        }
        if (actualbalanceagent > amount) {
            console.log("User Id : ", uuid);

            const transaction = await prisma.transaction.create({
                data: transaction_data
            })

            const trxSource = await prisma.transactionSource.create({
                data: {
                    ip_addr: ip_addr,
                    device: device,
                    trx: {
                        connect: {
                            id: transaction.id
                        }
                    }
                }
            })

            const transfer = await prisma.agentTransaction.create({
                data: {
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    transferedAmount: 0.00,
                    deductedAmount: parseFloat(amount),
                    trx: {
                        connect: {
                            id: transaction.id
                        }
                    }
                }
            })

            const lockedBalance = await prisma.lockedBalance.create({
                data: {
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    currentBalance: actualbalanceagent,
                    amountLocked: parseFloat(amount),
                    lockedStatus: true
                }
            })

            const lockedNumber = await prisma.lockedNumber.create({
                data: {
                    phone: mobile,
                    status: true,
                    trx: {
                        connect: {
                            id: transaction.id
                        }
                    }
                }
            })

            console.log("TRANSACATION BUILT > BALANCE LOCKED > NUMBER LOCKED");

            for (let i = 0; i < apicreds.length; i++) {
                if (apicreds[i].api.code == "TST") {
                    const res = await fetch(process.env.TSTBAL);
                    const data = await res.json();

                    console.log("Available Balance for TEST : ", data.items[0].balance);
                    if (data.items[0].balance >= amount) {
                        console.log("TEST API WORKING");
                        const res = await fetch(process.env.TSTREC);
                        const response = await res.json();
                        console.log(response.items[0].message);
                        trx_data = {
                            trx: {
                                connect: {
                                    id: transaction.id
                                }
                            },
                            api: {
                                connect: {
                                    id: apicreds[i].api.id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].api.id
                        trx_status = true
                        break;
                    } else {
                        console.log("TEST API DIDN't WORK");
                    }

                } else if (apicreds[i].api.code == "ETS") {
                    const res = await fetch(process.env.ETSBAL);
                    const data = await res.json();

                    console.log("Available Balance for ETS : ", data.items[0].balance);
                    if (data.items[0].balance >= amount) {
                        console.log("ETS API WORKING");
                        const res = await fetch(process.env.ETSREC);
                        const response = await res.json();
                        console.log(response.items[0].message);
                        const resp = saveResponse(response.items[0].message, transaction.id);
                        trx_data = {
                            trx: {
                                connect: {
                                    id: transaction.id
                                }
                            },
                            api: {
                                connect: {
                                    id: apicreds[i].api.id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].api.id
                        trx_status = true
                        break;
                    } else {
                        console.log("ETS DIDN'T WORK")
                    }

                } else if (apicreds[i].api.code == "ZLO") {
                    const res = await fetch(process.env.ZLOBAL);
                    const data = await res.json();

                    console.log("Available Balance for ZOLO : ", data.items[0].balance);
                    if (data.items[0].balance >= amount) {
                        console.log("ZOLO API WORKING");
                        const res = await fetch(process.env.ZLOREC);
                        const response = await res.json();
                        console.log(response.items[0].message);
                        trx_data = {
                            trx: {
                                connect: {
                                    id: transaction.id
                                }
                            },
                            api: {
                                connect: {
                                    id: apicreds[i].api.id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].api.id
                        trx_status = true
                        break;
                    } else {
                        console.log("ZOLO DIDN'T WORK");
                    }
                } else if (apicreds[i].api.code == "DU") {
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
                                        trx: {
                                            connect: {
                                                id: transaction.id
                                            }
                                        },
                                        api: {
                                            connect: {
                                                id: apicreds[i].api.id
                                            }
                                        }
                                    }
                                    trx_api_id = apicreds[i].api.id
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
                } else if (apicreds[i].api.code == "LIV") {
                    console.log("inside LIVE API")
                    const apiurl = process.env.LIV
                    const apikey = process.env.LIV_APIKEY
                    const client_id = process.env.LIV_CLIENT_ID
                    const transaction_id = '00' + transaction.id
                    const msisdn = mobile
                    if (operator_name.name == "GP"){
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
                        trx_api_id = apicreds[i].api.id
                        trx_status = true
                        trx_data = {
                            trx: {
                                connect: {
                                    id: transaction.id
                                }
                            },
                            api: {
                                connect: {
                                    id: apicreds[i].api.id
                                }
                            }
                        }
                    }) 
                    .catch(e => {
                        console.log(e);
                        console.log("LIVE DIDNT WORK");
                    }) 

                    // await liveReq(send_data, apiurl);
                    // console.log(trx_status, " before trx ");
                    // trx_data = {
                    //     trx: {
                    //         connect: {
                    //             id: transaction.id
                    //         }
                    //     },
                    //     api: {
                    //         connect: {
                    //             id: apicreds[i].api.id
                    //         }
                    //     }
                    // }
                    // trx_api_id = apicreds[i].api.id
                    // trx_status = true
                    // console.log(trx_status, " after trx ");
                    // console.log(trx_data);
                }
            }

            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);

            if (trx_status) {
                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${userId} for the amount ${amount}`
                const syslog = await prisma.systemLog.create({
                    data: {
                        type: "Recharge",
                        detail: logmsg
                    }
                })
                const apitrx = await prisma.apiTransaction.create({
                    data: trx_data,
                })

                const updateNumber = await prisma.lockedNumber.update({
                    where: {
                        id: lockedNumber.id
                    },
                    data: {
                        status: false,
                    }
                })

                const updateBalance = await prisma.lockedBalance.update({
                    where: {
                        id: lockedBalance.id
                    },
                    data: {
                        lockedStatus: false,
                        trx_id: {
                            connect: {
                                id: apitrx.id
                            }
                        }
                    }
                })

                const record = await prisma.transactionRecordApi.create({
                    data: {
                        transaction: {
                            connect: {
                                id: apitrx.id
                            }
                        },
                        status: true,
                        statement: "Successfully recharged"
                    }
                })


                console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
                console.log("Add a entry of success recharge balance and adjust the agents real balance");



                // TODO
                // GET AGENT CUT FROM AGENTPERCENTAGE TABLE
                const percent = await prisma.agentPercentage.findFirst({
                    where: {
                        // userId: userId
                        user: {
                            uuid: uuid
                        }
                    }
                })

                console.log("Agent Percentage : ", percent.percentage);

                let earned = amount / 100 * percent.percentage

                const earnedData = {
                    agent: {
                        connect: {
                            id: userId
                        }
                    },
                    amount: earned,
                    trx: {
                        connect: {
                            id: transaction.id
                        }
                    }
                }

                const agentEarning = await prisma.agentEarning.create({
                    data: earnedData
                })

                console.log("Agent Earned : ", agentEarning);

                // CREATE ENTRY ON AGENTEARNING TABLE
                // GET API PERCENTAGE FROM APIPERCENT TABLE
                // const orgPercent = 2.0

                const orgPercent = await prisma.apiPercent.findFirst({
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
                    trx: {
                        connect: {
                            id: transaction.id
                        }
                    },
                    api: {
                        connect: {
                            id: trx_api_id
                        }
                    },
                    cutAmount: orgCut
                }
                const orgEarning = await prisma.organizationEarned.create({
                    data: orgEarnedData
                })
                console.log("Organization earning : ", orgEarning);
                // CREATE ENTRY ORGANIZATION EARNED TABLE

            } else {
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${userId} for the amount ${amount}`
                const syslog = await prisma.systemLog.create({
                    data: {
                        type: "Recharge",
                        detail: logmsg
                    }
                })
                const upd_transaction = await prisma.transaction.update({
                    where: {
                        id: transaction.id,
                    },
                    data: {
                        rechargeStatus: false
                    }
                })

                const transfer = await prisma.agentTransaction.create({
                    data: {
                        user: {
                            connect: {
                                id: userId
                            }
                        },
                        transferedAmount: parseFloat(amount),
                        deductedAmount: 0.00,
                        trx: {
                            connect: {
                                id: transaction.id
                            }
                        }
                    }
                })

                console.log("transaction returned");

                const updateNumber = await prisma.lockedNumber.update({
                    where: {
                        id: lockedNumber.id
                    },
                    data: {
                        status: false,
                        trx: {
                            connect: {
                                id: transaction.id
                            }
                        }
                    }
                })

                const updateBalance = await prisma.lockedBalance.update({
                    where: {
                        id: lockedBalance.id
                    },
                    data: {
                        lockedStatus: false,
                    }
                })
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

const allTransactions = async (req, res, next) => {
    const trx = await prisma.apiTransaction.findMany({ include: { api: true, trx: true } });

    let result = []

    for(let i=0; i<trx.length; i++){
        let data = {
            id: trx[i].id,
            createdAt: trx[i].createdAt,
            api: trx[i].api.code,
            phone: trx[i].trx.phone,
            amount: trx[i].trx.amount,
            agent: trx[i].trx.agent
        }
        result.push(data);
    }

    res.status(200).json({
        message: result
    })
}

const allagentTrx = async (req, res, next) => {
    let userId = 11;
    const atrx = await prisma.agentTransaction.findMany(
        {
            where: {
                userId: userId
            },
            include: {
                user: true
            }
        }
    )

    res.status(200).json({
        message: atrx
    })
}

const agentBalance = async (req, res, next) => {
    const uid = req.params.id

    let mainBalance = 0.00;
    const agentTrx = await prisma.agentTransaction.findMany({
        where: {
            user: {
                is: {
                    uuid: uid
                }
            }
        }
    })

    for (let i = 0; i < agentTrx.length; i++) {
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].deductedAmount
    }
    console.log(`main balance from trasaction calculation , ${mainBalance}`)
    const lockedbalances = await prisma.lockedBalance.findMany({
        where: {
            lockedStatus: true,
            user: {
                is: {
                    uuid: uid
                }
            }
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

export default { submitData, allTransactions, agentBalance, asyncTest, asyncURL, allagentTrx, asyncHit };

