const fetch = require("node-fetch-commonjs");
const db = require("../models");

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

exports.rechargeLive = async({plan, data, plan_type, network, api}) =>{
    let returnVal = {}

    let phone_number = data.prefix + data.ui_number
    console.log(api.status)

    if(api.status == false) {
        returnVal = {
            status: "Failed",
            message: "Api Inactive"
        }
    }else{
        console.log("inside LIVE API")
        const apiurl = process.env.LIV
        const apikey = process.env.LIV_APIKEY
        const client_id = process.env.LIV_CLIENT_ID
        const transaction_id = '00' + transaction.id
        const msisdn = phone_number
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
                "amount": parseInt(sendAmount),
                "transaction_id": transaction_id,
                "client_id": client_id,
                "operator": operator
            }
        }

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
                transactionId: transaction.uuid,
                apiId: api.uuid
            }
            trx_api_id = api.uuid
            trx_status = true
        }) 
        .catch(e => {
            console.log(e);
            console.log("LIVE DIDNT WORK");
        }) 

        returnVal = {
            status: "success",
            message: "Api Active"
        }
    }
    

    return returnVal
}