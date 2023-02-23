import fetch from "node-fetch";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// AGENT ID is 6 - currently under used from DATABASE
// const uid = 6

// pending balance, actual balance calculation area
const uid = 9

let mainBalance = 0.00;
const agentTrx = await prisma.agentTransaction.findMany({
    where: {
        userId: uid
    }
})

for (let i = 0; i<agentTrx.length; i++){
    mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].deductedAmount
}
console.log(`main balance from trasaction calculation , ${mainBalance}`)
const lockedbalances = await prisma.lockedBalance.findMany({
    where: {
        lockedStatus: true
    }
})

let pendingRecharge = 0.00

for(let i = 0; i<lockedbalances.length; i++){
    pendingRecharge += lockedbalances[i].amountLocked
}

console.log(`Pending Balance: ${pendingRecharge}`);
let actualbalance = mainBalance - pendingRecharge

console.log(`Actual Balance ${actualbalance}`);

// pending balance, actual balance calculation area ENDS

const agentBalance = async(req, res, next) => {
    res.status(200).json({
        balance: actualbalance
    })
}

const asyncTest = async(req, res, next) => {
    let responseurl = "http://localhost:3000/asynchit";

    res.status(200).json({
        msg: "Response URL provided",
        url: responseurl
    });
}

const asyncURL = async(req, res, next) => {
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

const asyncHit = async(req, res, next) => {

    console.log("asyn hit coming");

    let retry = 5;
    let respMsg = {}
    for(retry; retry > 0; retry--){
        console.log(retry);
        let data = {
            "loop": retry
        }
        await new Promise((resolve)=> {
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
                        if (response.msg == 'SUCCESS'){
                            respMsg = {
                                msg: "SUCCESS"
                            }
                        } else {
                            respMsg = {
                                msg: "FAILED"
                            }
                        }
                    })
            ), 10000);
        })
        console.log(`controller retry ${retry}`)
        if (respMsg.msg == "SUCCESS")
            break;
        
    }

    res.status(200).json(respMsg);
}

const submitData = async(req, res, next) => {

    let userId = parseInt(req.body.userId)
    let mobile = req.body.mobile
    let amount = req.body.amount
    let country = req.body.country
    let network = req.body.network
    let service = req.body.service

    // FLAGS FOR TRX AND STATUS DATA
    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    // BALANCE AND PREVIOUS LOCKED BALANCE CALCULATION

    let mainBalance = 0.00;
    const agentTrx = await prisma.agentTransaction.findMany({
        where: {
            userId: userId
        }
    })

    for (let i = 0; i<agentTrx.length; i++){
        mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].deductedAmount
    }
    console.log(`main balance from trasaction calculation , ${mainBalance}`)

    const lockedbalances = await prisma.lockedBalance.findMany({
        where: {
            userId: userId,
            lockedStatus: true
        }
    })
    
    
    let pendingRecharge = 0.00
    
    for(let i = 0; i<lockedbalances.length; i++){
        pendingRecharge += lockedbalances[i].amountLocked
    }
    
    console.log(`Pending Balance: ${pendingRecharge}`);
    let actualbalanceagent = mainBalance - pendingRecharge
    
    console.log(`Actual Balance ${actualbalanceagent}`);

    // BALANCE CALCULATION ENDS

    // const apicreds = await prisma.api.findMany({
    //     where: {
    //         status: true
    //     }
    // });
    
    
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
    for (let i = 0; i< apis.length; i++){
        if(apis[i].api.status == true){
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

    if (lockedNumber.length > 0) {
        let msg = `This number is already engaged with a pending recharge : ${mobile}`;
        console.log(msg)
        console.log(lockedNumber)
        res.status(200).json({
            message: msg
        })
    }else{
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
        if (actualbalanceagent > amount){
            console.log("User Id : ", userId);
            
        
            const transaction = await prisma.transaction.create({
                data: transaction_data
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
                        connect:{
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
    
            for (let i=0; i<apicreds.length; i++){
                if(apicreds[i].api.code == "TST"){
                    const res = await fetch(
                        'http://127.0.0.1:8090/api/collections/testbalance/records'
                    );
                    const data = await res.json();
                    
                    console.log("Available Balance for TEST : ", data.items[0].balance);
                    if (data.items[0].balance >= amount){
                        console.log("TEST API WORKING");
                        const res = await fetch(
                            'http://127.0.0.1:8090/api/collections/testrecharge/records'
                        );
                        const response = await res.json();
                        console.log(response.items[0].message);
                        trx_data = {
                            trx : {
                                connect: {
                                    id: transaction.id
                                }
                            },
                            api:{
                                connect:{
                                    id: apicreds[i].api.id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].api.id
                        trx_status = true
                        break;
                    }else{
                        console.log("TEST API DIDN't WORK");
                    }
                    
                }else if(apicreds[i].api.code == "ETS"){    
                    const res = await fetch(
                        'http://127.0.0.1:8090/api/collections/etisalatbalance/records'
                    );
                    const data = await res.json();
        
                    console.log("Available Balance for ETS : ", data.items[0].balance);
                    if (data.items[0].balance >= amount){
                        console.log("ETS API WORKING");
                        const res = await fetch(
                            'http://127.0.0.1:8090/api/collections/etisalatrecharge/records'
                        );
                        const response = await res.json();
                        console.log(response.items[0].message);
                        trx_data = {
                            trx : {
                                connect: {
                                    id: transaction.id
                                }
                            },
                            api:{
                                connect:{
                                    id: apicreds[i].api.id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].api.id
                        trx_status = true
                        break;
                    }else{
                        console.log("ETS DIDN'T WORK")
                    }
        
                }else if(apicreds[i].api.code == "ZLO"){
                    const res = await fetch(
                        'http://127.0.0.1:8090/api/collections/zolobalance/records'
                    );
                    const data = await res.json();
        
                    console.log("Available Balance for ZOLO : ", data.items[0].balance);
                    if (data.items[0].balance >= amount){
                        console.log("ZOLO API WORKING");
                        const res = await fetch(
                            'http://127.0.0.1:8090/api/collections/zolorecharge/records'
                        );
                        const response = await res.json();
                        console.log(response.items[0].message);
                        trx_data = {
                            trx : {
                                connect: {
                                    id: transaction.id
                                }
                            },
                            api:{
                                connect:{
                                    id: apicreds[i].api.id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].api.id
                        trx_status = true
                        break;
                    }else{
                        console.log("ZOLO DIDN'T WORK");
                    }
                }else if(apicreds[i].api.code == "DU"){
                    console.log("INSIDE DU SIM");

                    let balance = 1000.00

                    console.log(`Available balance for DU Sim : ${balance}`);
                    if(balance >= amount){
                        await fetch('http://localhost:3000/asynctest', {
                            method: 'POST'
                        })
                        .then(response => response.json())
                        .then(async response => {
                            console.log(response.url);
                            return await fetch(response.url, {method: 'POST'});
                        })
                        .then(response => response.json())
                        .then(response => {
                            console.log(response);
                            if (response.msg == 'SUCCESS'){
                                console.log(trx_status, " before trx ");
                                trx_data = {
                                    trx : {
                                        connect: {
                                            id: transaction.id
                                        }
                                    },
                                    api:{
                                        connect:{
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
                        if(trx_status == true){
                            break;
                        }
                    }else{
                        console.log("DU SIM API DIDNT WORK");
                    }
                }
            }

            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);
    
            if(trx_status){
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
                        transaction:{
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
                        userId: userId
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

                let orgCut = amount / 100 * orgPercent.percent
                const orgEarnedData = {
                    trx: {
                        connect: {
                            id: transaction.id
                        }
                    },
                    api : {
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

            }else{
                const upd_transaction = await prisma.transaction.update({
                    where: {
                        id: transaction.id,
                    },
                    data: {
                        rechargeStatus: false
                    }
                })
                // const transaction = await prisma.transaction.create({
                //     data: {
                //         phone: mobile,
                //         amount: parseFloat(amount),
                //         agent: "Anonymous",
                //         doneBy: {
                //             connect: {
                //                 id: userId
                //             }
                //         },
                //         rechargeStatus: false,
                //         country: {
                //             connect: {
                //                 id: country
                //             }
                //         },
                //         mobile: {
                //             connect: {
                //                 id: network
                //             }
                //         },
                //         service: {
                //             connect: {
                //                 id: service
                //             }
                //         }
                //     }
                // })

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
        }else{
            console.log("INSUFFICIENT AGENT BALANCE, RECHARGE FAILED !!!");
        }
    }

    // res.status(200).json({
    //     message: `data got for ${req.body.mobile}`
    // })
}

const allTransactions = async(req, res, next) => {
    const trx = await prisma.apiTransaction.findMany({ include: {api: true, trx: true} });
    console.log(trx); 

    res.status(200).json({
        message: trx
    })
}

const allagentTrx = async(req, res, next) => {
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

export default {submitData, allTransactions, agentBalance, asyncTest, asyncURL, allagentTrx, asyncHit};

