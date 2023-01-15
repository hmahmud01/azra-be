import fetch from "node-fetch";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const submitData = async(req, res, next) => {
    const apicreds = await prisma.api.findMany({
        where: {
            status: true
        }
    });

    let mobile = req.body.mobile
    let amount = req.body.amount
    let country = req.body.country
    let network = req.body.network
    let service = req.body.service

    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    let agent_balance = 800.0;
    console.log("Amount to be recharge for : ", amount);

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

    let locked_number_data = {
        phone: mobile,
        status: true
    }


    if (agent_balance > amount){
        const transaction = await prisma.transaction.create({
            data: transaction_data
        })

        const lockedNumber = await prisma.lockedNumber.create({
            data: locked_number_data
        })

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
            }
        }
        console.log("Transaction Data : ", trx_data);
        console.log("Api ID: ", trx_api_id);
        console.log("Transaction Status : ", trx_status);

        if(trx_status){
            const trx = await prisma.apiTransaction.create({
                data: trx_data,
            })

            lockedNumber.u
            const record = await prisma.transactionRecordApi.create({
                data: {
                    transaction:{
                        connect: {
                            id: trx.id
                        }
                    },
                    status: true,
                    statement: "Successfully recharged"
                }
            })

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
            console.log("Balance Unavailable");
        }
    }else{
        console.log("INSUFFICIENT AGENT BALANCE, RECHARGE FAILED !!!");
    }

    res.status(200).json({
        message: `data got for ${req.body.mobile}`
    })
}

const allTransactions = async(req, res, next) => {
    const trx = await prisma.apiTransaction.findMany({ include: {api: true} });
    console.log(trx); 

    res.status(200).json({
        message: trx
    })
}

export default {submitData, allTransactions};

