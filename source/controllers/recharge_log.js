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
    where: {
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

if (plan.is_range && plan.credit_currency == plan.debit_currency) {
    debit_amount = parseInt(data.plan_amount)
} else if (!plan.is_range && plan.credit_currency == plan.debit_currency) {
    debit_amount = parseInt(data.plan_amount)
} else if (plan.is_range && plan.credit_currency != plan.debit_currency) {
    const currency = await db.currency.findOne({
        where: {
            credit_currency: plan.credit_currency,
            debit_currency: plan.debit_currency
        }
    })
    debit_amount = (parseInt(data.plan_amount) * currency.conversionValue).toFixed(2);
} else if (!plan.is_range && plan.credit_currency != plan.debit_currency) {
    const currency = await db.currency.findOne({
        where: {
            credit_currency: plan.credit_currency,
            debit_currency: plan.debit_currency
        }
    })
    debit_amount = (parseInt(data.plan_amount) * currency.conversionValue).toFixed(2);
} else {
    debit_amount = plan.credit_amount
}

if (lockedNumber.length > 0) {
    // NUMBER ENGAGEMENT RESPONSE
    let msg = `This number is already engaged with a pending recharge : ${mobile}`;
    console.log(msg)
    console.log(lockedNumber)
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

    res.json(apiResp)

} else {
    // IF NOT NUMBER ENGAGED

    let transaction_data = {
        phone: mobile,
        amount: parseFloat(debit_amount),
        agent: data.username,
        userId: user.uuid,
        rechargeStatus: true,
        countryId: network.countryId,
        mobileId: network.uuid,
        serviceId: req.body.service_code,
        planId: data.plan_id
    }
    // ========================================================
    // INITIALIZING TRANSACTION AND SALES ENTRY BEFORE API CALL
    // ========================================================
    const transaction = await db.transaction.create(transaction_data)

    // TODO
    let api_bal = 0.000
    let failed_bal = 0.000
    let api_profit = 0.000

    const purchase = await db.purchase.findOne({
        dist: api.name
    })

    if(purchase) {
        api_bal = purchase.purchase
        api_profit = purchase.commission * parseFloat(data.plan_amount)
    }

    const sale = await db.sales.create({
        balance: api_bal,
        amount: parseFloat(debit_amount),
        agent: data.username,
        number: data.ui_number,
        operator: network.name,
        api: api.name,
        profit: api_profit
    })

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


    // =============================================================
    // INITIALIZING TRANSACTION AND SALES ENTRY BEFORE API CALL DONE
    // MOVING TO API CALL
    // =============================================================

    // SAMPLE API CALL

    if (api.code == "ETS") {
        console.log("==================================")
        console.log("inside ETS API FOR ONEPREPAY")
        console.log("==================================")
        let type = "PinlessRequest"
        let terminal_id = process.env.TERMINALID
        let pass = process.env.PASSWORD
        let lang = "eng"
        let recepiept = '00' + transaction.id
        let number = "0" + data.ui_number
        console.log(`NUMBER TO TEST ${number}`)
        let amount = parseInt(data.plan_amount)
        let clerk_id = 1
        let prodcode = "ETSTOP"
        let url = "https://uae.q3cloud.me:545/Web"

        var xml_data = `<RequestXml><Type>${type}</Type><TerminalId>${terminal_id}</TerminalId><Password>${pass}</Password><Language>${lang}</Language><ReceiptNo>${recepiept}</ReceiptNo><AccountNo>${number}</AccountNo><Amount>${amount}</Amount><ClerkId>${clerk_id}</ClerkId><ProdCode>${prodcode}</ProdCode></RequestXml>`;

        var config = {
            method: 'get',
            url: `${url}/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CAccountNo%3E${number}%3C/AccountNo%3E%3CAmount%3E${amount}%3C/Amount%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`,
            headers: {
                'Content-Type': 'application/xml'
            },
            data: xml_data
        };

        axios(config)
            .then(async function (response) {
                let output = response.data;
                var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                console.log(stringXML);
                console.log(response.data);

                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(stringXML, "text/xml");
                let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;

                if (parseInt(statusCode) == 1) {
                    console.log("FAILED");
                } else {
                    console.log("SUCCEED");
                    let step = "PinlessRequest2ndStep"
                    var config = {
                        method: 'get',
                        url: `${url}/Get?RequestXml=%3CRequestXml%3E%3CType%3E${step}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3CAmount%3E${amount}%3C/Amount%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3C/RequestXml%3E`,
                        headers: {}
                    };

                    await axios(config)
                        .then(async function (response) {
                            let output = response.data;
                            var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                            console.log(stringXML);
                            console.log(response.data);

                            let parser = new DOMParser();
                            let xmlDoc = parser.parseFromString(stringXML, "text/xml");
                            let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;
                            let statusDesc = xmlDoc.getElementsByTagName("StatusDescription")[0].childNodes[0].nodeValue;
                            let transNo = xmlDoc.getElementsByTagName("TransNo")[0].childNodes[0].nodeValue;
                            let transDate = xmlDoc.getElementsByTagName("TransDate")[0].childNodes[0].nodeValue;
                            let balance = xmlDoc.getElementsByTagName("Balance")[0].childNodes[0].nodeValue;

                            console.log(`Trx made for ${statusCode} ${statusDesc} ${transNo} ${transDate} ${balance}`)
                            
                            // =====================================
                            // FAILED RESPONSE
                            // REVERTING THE ENTRIES
                            // =====================================

                            if (parseInt(statusCode) == 1) {
                                console.log("RECHARGE FAILED")
                                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                const syslog = await db.systemlog.create({
                                    type: "Recharge",
                                    detail: logmsg
                                })

                                const sale_upd = await db.sales.create({
                                    balance: failed_bal,
                                    amount: parseFloat(data.plan_amount),
                                    agent: data.username,
                                    number: data.ui_number,
                                    operator: network.name,
                                    api: api.name,
                                    profit: -(api_profit)
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
                                logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                res.json(apiResp)

                            } else if (parseInt(statusCode) == 0) {
                                // =====================================
                                // SUCCESS RESPONSE
                                // UPDATING THE ENTRIES WITH API ID
                                // =====================================

                                console.log("RECHARGE SUCCESS")
                                // const resp = await saveResponse(data, transaction.id, api.code);
                                trx_data = {
                                    transactionId: transaction.uuid,
                                    apiId: api.uuid
                                }
                                trx_api_id = api.uuid
                                trx_status = true

                                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                const syslog = await db.systemlog.create({
                                    type: "Recharge",
                                    detail: logmsg
                                })
                                console.log("API TRX")
                                const apitrx = await db.apitransaction.create(trx_data)
                                console.log("UNLOCKING NUMBER")
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
                                console.log("UNLOCKING AMOUNT")
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

                                if(purchase){
                                    let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)
        
                                    const update_purchase = await db.purchase.update(
                                        {
                                            purchase : upd_bal
                                        },
                                        {
                                            where: {
                                                dist: api.name
                                            }
                                        }
                                    )
                                }
                                console.log("TRX API RECORD")
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
                                if (orgPercent == null) {
                                    perc = 0.1
                                } else {
                                    perc = orgPercent.percent
                                }

                                // organization percentage calculation

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
                                logger.info(`${data.username} has recharged successfully in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                res.json(apiResp)
                            }
                        })
                        .catch(function (error) {
                            console.log("Trnsaction ERROR")
                        });
                }

            })
            .catch(function (error) {
                console.log(error);
            });

    }else {
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
        res.json(apiResp)
    }
}