import fetch from "node-fetch";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const submitData = async(req, res, next) => {
    console.log(req.body);

      const apicreds = await prisma.api.findMany({
        where: {
            status: true
        }
    });

    let mobile = req.body.mobile
    let amount = req.body.amount

    let trx_data = {}
    let trx_api_id = 0
    let trx_status = false

    console.log("Amount to be recharge for : ", amount);

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
    }else{
        console.log("Balance Unavailabe");
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

