import fetch from "node-fetch";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


let mainBalance = 1100.0
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

const agentBalance = async(req, res, next) => {
    res.status(200).json({
        balance: actualbalance
    })
}

async function f() {

    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 1000)
    });
  
    let result = await promise;
  
    alert(result);
}

const asyncTest = async(req, res, next) => {
    let responseurl = "http://localhost:3000/asyncurl";

    res.status(200).json({
        msg: "Response URL provided",
        url: responseurl
    });
}

const asyncURL = async(req, res, next) => {
    let response = "Recharge success"
    let data = {
        status: 200,
        msg: "SUCCESS"
    }
    console.log(data);
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(data), 120000)
    })

    let result = await promise;
    console.log(result);
    res.status(200).json(result);
}

const submitData = async(req, res, next) => {

    const agent_balance_info = await prisma.lockedBalance.findMany({ include: {trx_id: true} });

    // console.log(agent_balance_info);
    const apicreds = await prisma.api.findMany({
        where: {
            status: true
        }
    });

    let uid = req.body.userId

    let mobile = req.body.mobile
    let amount = req.body.amount
    let country = req.body.country
    let network = req.body.network
    let service = req.body.service

    let recharge_status_func = {
        status: true,
        uid: uid
    }

    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    let agent_balance = 800.0;
    console.log("Amount to be recharge for : ", amount);

    // find locked balances
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
        if (actualbalance > amount){
        
            const transaction = await prisma.transaction.create({
                data: transaction_data
            })
    
            const lockedBalance = await prisma.lockedBalance.create({
                data: {
                    currentBalance: agent_balance,
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
                if(apicreds[i].code == "TST"){
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
                                    id: apicreds[i].id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].id
                        trx_status = true
                        break;
                    }else{
                        console.log("TEST API DIDN't WORK");
                    }
                    
                }else if(apicreds[i].code == "ETS"){    
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
                                    id: apicreds[i].id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].id
                        trx_status = true
                        break;
                    }else{
                        console.log("ETS DIDN'T WORK")
                    }
        
                }else if(apicreds[i].code == "ZLO"){
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
                                    id: apicreds[i].id
                                }
                            }
                        }
                        trx_api_id = apicreds[i].id
                        trx_status = true
                        break;
                    }else{
                        console.log("ZOLO DIDN'T WORK");
                    }
                }else if(apicreds[i].code == "DU"){
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
                            console.log(trx_status, " before trx ");
                            trx_data = {
                                trx : {
                                    connect: {
                                        id: transaction.id
                                    }
                                },
                                api:{
                                    connect:{
                                        id: apicreds[i].id
                                    }
                                }
                            }
                            trx_api_id = apicreds[i].id
                            trx_status = true
                            console.log(trx_status, " after trx ");
                            console.log(trx_data);
                        })
                        break;
                    }else{
                        console.log("DU SIM API DIDNT WORK");
                    }
                }
            }
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
            }else{
                const transaction = await prisma.transaction.create({
                    data: {
                        phone: mobile,
                        amount: parseFloat(amount),
                        agent: "Anonymous",
                        rechargeStatus: false,
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
                })
    
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

export default {submitData, allTransactions, agentBalance, asyncTest, asyncURL};

