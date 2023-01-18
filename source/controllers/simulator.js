import fetch from "node-fetch";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const asyncTest = async(req, res, next) => {
    let responseurl = "localhost:3000/asyncurl";

    res.status(200).json({
        msg: "Response URL provided",
        url: responseurl
    });
}

const asyncURL = async(req, res, next) => {
    let response = "Recharge success"
    setTimeout(
        res.status(200).json({
            status: 200,
            msg: "SUCCESS"
        })
    , 2000)
}

const submitData = async(req, res, next) => {
    const agent_balance_info = await prisma.lockedBalance.findMany({ include: {trx_id: true} });

    console.log(agent_balance_info);
    const apicreds = await prisma.api.findMany({
        where: {
            status: true
        }
    });

    let uid = req.body.userId

    let mobile = req.body.mobile
    let amount = req.body.amount

    let recharge_status_func = {
        status : true,
        uid: uid
    }

    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    let agent_balance = 600.0;

    for (let i=0; i< agent_balance_info.length; i++){
        if (agent_balance_info[i].lockedStatus)
            agent_balance -= agent_balance_info[i].amountLocked
    }

    console.log("Amount to be recharge for : ", amount);
    console.log("actual balance", agent_balance);

    if(recharge_status_func.status == false){
        console.log("A transaction is pending please wait till completion");
        res.status(400).json({
            message: {
                msg: "A Transcation is pending",
            }
        })
    }else{
        if (agent_balance > amount){
            console.log("BALANCE RECHARGE INITIATE");
            console.log("Balance Lock here");
    
            let locked_data = {
                currentBalance: 200.0,
                amountLocked: parseFloat(amount),
                lockedStatus: true
            }
            const locked_trx = await prisma.lockedBalance.create({
                data: locked_data,
            });
    
            console.log(locked_trx);
    
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
                            phone: mobile,
                            amount: parseInt(amount),
                            agent: "Anonymous",
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
                            phone: mobile,
                            amount: parseInt(amount),
                            agent: "Anonymous",
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
                            phone: mobile,
                            amount: parseInt(amount),
                            agent: "Anonymous",
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
            console.log(trx_data);
            console.log(trx_api_id);
            console.log(trx_status);
    
            if(trx_status){
                const trx = await prisma.apiTransaction.create({
                    data: trx_data,
                })
    
                console.log(trx);
    
                let unlocked_data = {
                    currentBalance: 200.0,
                    amountLocked: parseFloat(amount),
                    lockedStatus: false,
                    trx_id: {
                        connect: {
                            id: trx.id
                        }
                    }
                }
    
                const unlocked_trx = await prisma.lockedBalance.update({
                    where: {
                        id: locked_trx.id
                    },
                    data: unlocked_data
                })
    
                console.log("Balance Unlocking");
                console.log("Updated locked balance status : ", unlocked_trx);
                console.log("NEGATE THE recharge amount from agents Real Balance");
            }else{
                console.log("Balance Unavailable");
                let unlocked_data = {
                    currentBalance: 200.0,
                    amountLocked: parseFloat(amount),
                    lockedStatus: false,
                }
    
                const unlocked_trx = await prisma.lockedBalance.update({
                    where: {
                        id: locked_trx.id
                    },
                    data: unlocked_data
                })
                console.log("unlocking balance only no negate from the agent balance");
                res.status(200).json({
                    message: {
                        msg: "Transaction Successful",
                        data: `data got for ${req.body.mobile}`
                    }
                })
            }
        }else{
            console.log("INSUFFICIENT AGENT BALANCE, RECHARGE FAILED !!!");
            res.status(400).json({
                message: {
                    msg: "Insufficient Balance",
                }
            })
        }
    }
}

const allTransactions = async(req, res, next) => {
    const trx = await prisma.apiTransaction.findMany({ include: {api: true} });
    console.log(trx); 

    res.status(200).json({
        message: trx
    })
}

export default {submitData, allTransactions, asyncTest, asyncURL};

