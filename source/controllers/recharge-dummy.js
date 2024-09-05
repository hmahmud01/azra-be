const db = require("../models");
const { Op } = require('sequelize');
const Sequelize = require("sequelize");
const fetch = require("node-fetch-commonjs");
const qs = require('qs');
const axios = require('axios');
const { DOMParser } = require('xmldom')

const rechargeModule = require('./recharge_module');

const LogLater = require('../authsrc/logger');
const e = require("express");
const uuid = require('uuid');

var dateFormat = require('dateformat');
var asiaTime = new Date().toLocaleString('en-BN', { timeZone: 'Asia/Dhaka' });
var log_date = dateFormat(asiaTime, "yyyy-mm-dd");


var log_dir = `./logs/recharge-logs/`;
var callback_log = new LogLater(`${log_dir}/-${log_date}.log`);

// PAKISTAN OPERATOR CONSTANTS FOR EZLOAD
const UFONE = "Ufone"
const WARID = "Warid"
const ZONG = "Zong"
const TELENOR = "Telenor"
const JAZZ = "Jazz"
const MOBILINK = "Mobilink"

exports.entries = async(data) => {
    console.log("ENTRIES")
}

exports.dtone = async (req, res, next) => {
    const external_id = uuid.v4()

    const currentDate = new Date();
    const milliseconds = currentDate.getMilliseconds();
    console.log(milliseconds);

    let data = JSON.stringify({
        "external_id": `${external_id}`,
        "product_id": 68,
        "credit_party_identifier": {
            "mobile_number": "+639173143100"
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://preprod-dvs-api.dtone.com/v1/async/transactions',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic YmZmM2ZkMmItZmRiNS00MmUyLTk0NDUtY2FjNDJiNzYyOWNjOjAwOTMxZTBmLThjOWItNGE0Mi1hMTE2LTUwOTAyNmRiOGU5OQ=='
        },
        data: data
    };

    axios.request(config)
        .then(async (response) => {
            console.log(JSON.stringify(response.data));

            if (response.data.status.class.message == "CREATED") {
                let config_confirm = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `https://preprod-dvs-api.dtone.com/v1/async/transactions/${response.data.id}/confirm`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic YmZmM2ZkMmItZmRiNS00MmUyLTk0NDUtY2FjNDJiNzYyOWNjOjAwOTMxZTBmLThjOWItNGE0Mi1hMTE2LTUwOTAyNmRiOGU5OQ=='
                    }
                };


                await axios.request(config_confirm)
                    .then(async (response) => {

                        console.log(JSON.stringify(response.data));
                        res.json({ message: response.data.status.class.message })

                        if (response.data.status.class.message == "CONFIRMED") {

                        }
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                res.json({ message: response.data.status.class.message })
            }

        })
        .catch((error) => {
            console.log(error);
        });

}

exports.availableCountry = async (req, res, next) => {
    accessLog.info(`ACCESS AVAILABLE COUNTRY|${JSON.stringify(req.body)}`)
    let data = {
        countries: [
            {
                name: "Bangladesh",
                iso2: "1",
                callingCode: "880",
                phoneNumberLength: "10",
                currencyCode: "BD",
                settings: {
                    services: [
                        {
                            code: "880",
                            regex: "^[1]{1}[0-9]{10}$",
                            data: [
                                {
                                    "code": "MR",
                                    "regex": "^[1]{1}[0-9]{10}$",
                                    "denominationStep": 0
                                }
                            ],
                            maxLength: 10,
                            prefix: "+880",
                            multiRegion: true
                        }
                    ]
                }
            },
            {
                name: "India",
                iso2: "1",
                callingCode: "91",
                phoneNumberLength: "10",
                currencyCode: "IN",
                settings: {
                    services: [
                        {
                            code: "91",
                            regex: "^[0-9]{10}$",
                            data: [
                                {
                                    "code": "MR",
                                    "regex": "^[0-9]{10}$",
                                    "denominationStep": 0
                                }
                            ],
                            maxLength: 10,
                            prefix: "91",
                            multiRegion: true
                        }
                    ]
                }
            }
        ],
        status: "success",
        statusCode: 200
    }

    console.log(data)
    res.json(data)
}

exports.ezltry = async (req, res, next) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
    accessLog.info("CHECKING access NOTHING")

    const apiUrl = "https://payments-central.com/api/User/Transaction"
    const checkUrl = "https://payments-central.com/api/User/TransactionCheck"

    var querydata = JSON.stringify({
        "SessionId": "aaead679d0aa42acbc43a62a154279a2",
        "ServiceId": 17,
        "Input": {
            "Amount": 100,
            "PhoneNumber": "3089304456"
        },
        "Reference": "EZL-6272024-001"
    });


    var config = {
        method: 'post',
        url: apiUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        data: querydata
    };

    const apicall = await axios(config)

    if (apicall) {
        let trxId = apicall.TransactionId
        console.log(apicall.data.TransactionId, apicall.TransactionId)
        console.log(JSON.stringify(apicall.data))
        let trxcheck = JSON.stringify({
            SessionId: "aaead679d0aa42acbc43a62a154279a2",
            TransactionId: trxId
        })

        var config2 = {
            method: 'post',
            url: checkUrl,
            headers: {
                'Content-Type': 'application/json'
            },
            data: trxcheck
        };

        const ezlCheck = await axios(config2)

        if (ezlCheck) {
            console.log(JSON.stringify(ezlCheck.data))
            console.log("EZL CHECK 1st call")
            console.log(ezlCheck.data.TransactionStatusName)

            if (ezlCheck.data.TransactionStatusName == "Initial") {
                console.log("INITIAL CHECK FIRST IF LOOP")
                const initialCheck = await axios(config2)
                if (initialCheck) {
                    if (initialCheck.data.TransactionStatusName == "Processing") {
                        console.log("PROCESSING CHECK INSIDE INITIAL LOOP")
                        const processingCheck1 = await axios(config2)
                        if (processingCheck1) {
                            console.log("SUCCESS CHECK CHECKIN > PROCESSING > INITIAL")
                            if (processingCheck1.data.TransactionStatusName == "Successful") {
                                // trx_data = {
                                //     transactionId: transaction.uuid,
                                //     apiId: api.uuid
                                // }
                                // trx_api_id = api.uuid
                                // trx_status = true
                            }
                        }
                    } else if (initialCheck.data.TransactionStatusName == "Successful") {
                        console.log("SUCCESS > INITIAL")
                        // trx_data = {
                        //     transactionId: transaction.uuid,
                        //     apiId: api.uuid
                        // }
                        // trx_api_id = api.uuid
                        // trx_status = true
                    }
                }

            } else if (ezlCheck.data.TransactionStatusName == "Processing") {
                console.log("PROCESSING CHECK 2ND IF")
                const processingCheck = await axios(config2)
                if (processingCheck) {
                    console.log("SUCCESS CHECKIN > PROCESSING")
                    if (processingCheck.data.TransactionStatusName == "Successful") {
                        //     trx_data = {
                        //         transactionId: transaction.uuid,
                        //         apiId: api.uuid
                        //     }
                        //     trx_api_id = api.uuid
                        //     trx_status = true
                        // }
                    }
                } else if (ezlCheck.data.TransactionStatusName == "Successful") {
                    console.log("SUCCESS CHECK IF INITAL FAILS")
                    // trx_data = {
                    //     transactionId: transaction.uuid,
                    //     apiId: api.uuid
                    // }
                    // trx_api_id = api.uuid
                    // trx_status = true
                }

                // const ezlchek2 = await axios(config2)

                // if(ezlchek2){
                //     console.log("EZL CHECK 2nd call")
                //     console.log(JSON.stringify(ezlchek2.data))
                //     console.log(ezlchek2.data.TransactionStatusName)
                // }

            }
        }

        res.json({
            msg: "CHECKING"
        })


    }
}

exports.oppPin = async (req, res, next) => {
    console.log("inside OPP PIN TEST")
    let type = "PinRequest"
    let terminal_id = "TESTOPP-1"
    let pass = "7AW85CL32R"
    let lang = "eng"
    let recepiept = "25107-046"
    let amount = 30
    let clerk_id = 1
    let prodcode = "TSTSTC"

    var url = `https://test.q3cloud.me:444/Web/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CValueCode%3E${amount}%3C/ValueCode%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CRefNo%3E23005-059%3C/RefNo%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    axios(config)
        .then(function (response) {
            let output = response.data;
            var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            console.log(stringXML);
            console.log(response.data);

            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(stringXML, "text/xml");
            let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;
            let Pin = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;

            if (parseInt(statusCode) == 1) {
                console.log("FAILED");
                res.json({
                    msg: "OPP PIN TEST Failed"
                })
            } else {
                let Pin = xmlDoc.getElementsByTagName("Pin")[0].childNodes[0].nodeValue;
                console.log("succeed")
                res.json({
                    msg: `PIN TEST SUCCEED ${Pin}`
                })
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

exports.testezl = async (req, res, next) => {
    var data = JSON.stringify({
        "SessionId": "aaead679d0aa42acbc43a62a154279a2",
        "ServiceId": 3,
        "Input": {
            "Amount": 20,
            "PhoneNumber": "923184471353"
        },
        "Reference": "01uid"
    });

    var config = {
        method: 'post',
        url: 'https://payments-central.com/api/User/Transaction',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    const testapi = await axios(config)
    console.log("TEST API : ", testapi)
    if (testapi) {
        let trx_data = testapi.data.TransactionId
        var check_data = JSON.stringify({
            "SessionId": "aaead679d0aa42acbc43a62a154279a2",
            "TransactionId": trx_data
        });

        var config = {
            method: 'post',
            url: 'https://payments-central.com/api/User/TransactionCheck',
            headers: {
                'Content-Type': 'application/json'
            },
            data: check_data
        };

        const returnapi = await axios(config)
        console.log("RETURN API : ", returnapi)
    }

    res.json({
        msg: "CHECKING"
    })


}
exports.testrdy = async (req, res, next) => {
    console.log("=========\nRDY CONNECTE\n===========");

    const apiUrl = "https://www.rechargedaddy.in/RDRechargeAPI/RechargeAPI.aspx"
    const checkUrl = "https://www.rechargedaddy.in/RDRechargeAPI/RechargeAPI.aspx"
    let refno = "RDY - 000123"

    // let sercode = ""

    // if (network.name == "Airtel") {
    //     sercode = "AR"
    // } else if (network.name == "BSNL") {
    //     sercode = "BS"
    // } else if (network.name == "Vodafone") {
    //     sercode = "VF"
    // } else if (network.name == "Idea") {
    //     sercode = "ID"
    // }

    let resData = qs.stringify({
        "MobileNo": "9947539329",
        "APIKey": "Ye8AfUFGIgicYRTqKHFaHe2f1duYrEz4gHq",
        "REQTYPE": "RECH",
        "REFNO": refno,
        "SERCODE": "VF",
        "CUSTNO": "9007540682",
        "AMT": 50,
        "STV": 0,
        "RESPTYPE": "JSON"
    })


    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: apiUrl,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: resData
    };

    const reqax = await axios.request(config)
    console.log(reqax)
    return res.json({
        reqax
    })
}

exports.oppdu = async (req, res, next) => {
    console.log("inside OPP Du TEST")
    let type = "PinlessRequest"
    let terminal_id = process.env.TERMINALID
    let pass = process.env.PASSWORD
    let lang = "eng"
    let recepiept = "240306-004"
    let number = "0552950013"
    let amount = 5
    let clerk_id = 1
    let prodcode = "DUCTOP"
    let url = "https://uae.q3cloud.me:545/Web"

    var data = `<RequestXml><Type>${type}</Type><TerminalId>${terminal_id}</TerminalId><Password>${pass}</Password><Language>${lang}</Language><ReceiptNo>${recepiept}</ReceiptNo><AccountNo>${number}</AccountNo><Amount>${amount}</Amount><ClerkId>${clerk_id}</ClerkId><ProdCode>${prodcode}</ProdCode></RequestXml>`;

    var config = {
        method: 'get',
        url: `${url}/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CAccountNo%3E${number}%3C/AccountNo%3E%3CAmount%3E${amount}%3C/Amount%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`,
        headers: {
            'Content-Type': 'application/xml'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
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

                axios(config)
                    .then(function (response) {
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
                    })
                    .catch(function (error) {
                        console.log("Trnsaction ERROR")
                    });
            }

        })
        .catch(function (error) {
            console.log(error);
        });
    res.json({
        msg: "OPP DU INSIDE"
    })
}

exports.oppetsnba = async (req, res, next) => {
    console.log("inside OPP ETS NBA TEST")
    let type = "PinlessRequest"
    let terminal_id = process.env.TERMINALID
    let pass = process.env.PASSWORD
    let lang = "eng"
    let recepiept = "240306-009"
    let number = "0502447666"
    let amount = 0
    let clerk_id = 1
    let prodcode = "ETSTON"
    let url = "https://uae.q3cloud.me:545/Web"

    // <RequestXml>
    //     <Type>PinlessRequest</Type>
    //     <TerminalId>XXXXXXX</TerminalId>
    //     <Password>XXXXXXX</Password>
    //     <Language>eng</Language>
    //     <ReceiptNo>Optional</ReceiptNo>
    //     <AccountNo>050xxxxxxx</AccountNo>
    //     <Amount>0</Amount>
    //     <ClerkId>1</ClerkId>
    //     <ProdCode>PPPPPP</ProdCode>
    //     <RefNo>Mandatory</RefNo>
    // </RequestXml> 

    var data = `<RequestXml><Type>${type}</Type><TerminalId>${terminal_id}</TerminalId><Password>${pass}</Password><Language>${lang}</Language><ReceiptNo>${recepiept}</ReceiptNo><AccountNo>${number}</AccountNo><Amount>${amount}</Amount><ClerkId>${clerk_id}</ClerkId><ProdCode>${prodcode}</ProdCode><RefNo>${recepiept}</RefNo></RequestXml>`;

    var config = {
        method: 'get',
        url: `${url}/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CAccountNo%3E${number}%3C/AccountNo%3E%3CAmount%3E${amount}%3C/Amount%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3C/RequestXml%3E`,
        headers: {
            'Content-Type': 'application/xml'
        },
        data: data
    };

    axios(config)
        .then(async function (response) {
            let output = response.data;
            var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            console.log(stringXML);
            console.log(output);

            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(stringXML, "text/xml");
            console.log(xmlDoc);
            let items = xmlDoc.getElementsByTagName("Item")[0].childNodes[0].nodeValue;
            console.log(items);
            console.log(JSON.parse(items));

            // response after this api hit
            let resp = {
                nbapackages: [
                    {
                        offerName: '1GB per day for 28 days. AED 50',
                        offerID: '128519292',
                        offerPrice: 49.99
                    },
                    {
                        offerName: '1GB local daily for 30 days. AED 45',
                        offerID: '128519293',
                        offerPrice: 44.99
                    },
                    {
                        offerName: '1GB daily for 30 days. AED 30',
                        offerID: '128519294',
                        offerPrice: 30
                    },
                    {
                        offerName: '1GB Local daily for 60 days. AED80',
                        offerID: '128519295',
                        offerPrice: 80
                    },
                    {
                        offerName: '30 Intl Mins daily Ind.Pak.Ban.Egy.Afg. AED30',
                        offerID: '128519296',
                        offerPrice: 30
                    }
                ],
                ResponseCode: 0,
                ResponseDescription: 'Request Processed Successfully',
                MessageID: 'ca7ac6d9-1739-4e96-9b01-d5b6e6750065'
            }
        })
        .catch(function (error) {
            console.log("TRX ERROR")
        })

    res.json({
        msg: "OPP ETS NBA INSIDE"
    })
}

exports.oppets = async (req, res, next) => {
    console.log("inside OPP ETS TEST")
    let type = "PinlessRequest"
    let terminal_id = process.env.TERMINALID
    let pass = process.env.PASSWORD
    let lang = "eng"
    let recepiept = "240306-006"
    let number = "0502447666"
    let amount = 5
    let clerk_id = 1
    let prodcode = "ETSTOP"
    let url = "https://uae.q3cloud.me:545/Web"

    var data = `<RequestXml><Type>${type}</Type><TerminalId>${terminal_id}</TerminalId><Password>${pass}</Password><Language>${lang}</Language><ReceiptNo>${recepiept}</ReceiptNo><AccountNo>${number}</AccountNo><Amount>${amount}</Amount><ClerkId>${clerk_id}</ClerkId><ProdCode>${prodcode}</ProdCode></RequestXml>`;

    var config = {
        method: 'get',
        url: `${url}/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CAccountNo%3E${number}%3C/AccountNo%3E%3CAmount%3E${amount}%3C/Amount%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`,
        headers: {
            'Content-Type': 'application/xml'
        },
        data: data
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
                    .then(function (response) {
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
                    })
                    .catch(function (error) {
                        console.log("Trnsaction ERROR")
                    });
            }

        })
        .catch(function (error) {
            console.log(error);
        });
    res.json({
        msg: "OPP ETS INSIDE"
    })
}


exports.opptest = async (req, res, next) => {
    console.log("inside OPP TEST")
    let type = "PinlessRequest"
    let terminal_id = "TESTOPP-1"
    let pass = "7AW85CL32R"
    let lang = "eng"
    let recepiept = "25107-046"
    let number = "0501234567"
    let amount = 5
    let clerk_id = 1
    let prodcode = "TSTTOP"

    var data = `<RequestXml><Type>${type}</Type><TerminalId>${terminal_id}</TerminalId><Password>${pass}</Password><Language>${lang}</Language><ReceiptNo>${recepiept}</ReceiptNo><AccountNo>${number}</AccountNo><Amount>${amount}</Amount><ClerkId>${clerk_id}</ClerkId><ProdCode>${prodcode}</ProdCode></RequestXml>`;

    var config = {
        method: 'get',
        url: `https://test.q3cloud.me:444/Web/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CAccountNo%3E${number}%3C/AccountNo%3E%3CAmount%3E${amount}%3C/Amount%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`,
        headers: {
            'Content-Type': 'application/xml'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
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
                    url: `https://test.q3cloud.me:444/Web/Get?RequestXml=%3CRequestXml%3E%3CType%3E${step}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3CAmount%3E${amount}%3C/Amount%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3C/RequestXml%3E`,
                    headers: {}
                };

                axios(config)
                    .then(function (response) {
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
                    })
                    .catch(function (error) {
                        console.log("Trnsaction ERROR")
                    });
            }

        })
        .catch(function (error) {
            console.log(error);
        });
    res.json({
        msg: "OPP TEST INSIDE"
    })
}

exports.plans = async (req, res, next) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
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

    for (let i = 0; i < groups.length; i++) {
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
        for (let j = 0; j < plandata.length; j++) {
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

exports.operators = async (req, res, next) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
    let data = { "country_code": "BD", "service_code": "MR" }

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

    for (let i = 0; i < circlelist.length; i++) {
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

    for (let i = 0; i < operatorCodes.length; i++) {
        const operator = await db.mobile.findOne({
            where: {
                uuid: operatorCodes[i].mobileId
            }
        })

        console.log(operator.name)
        console.log(operatorCodes[i])

        let operatorData = {
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

exports.operatorCheck = async (req, res, next) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
    try {

        let service_code = req.body.service_code
        let country_code = req.body.country_code
        let ui_number = req.body.ui_number
        let prefix = req.body.prefix

        let mobId = ""
        let setting = {}

        const operatorsetting = await db.mobilesetting.findAll({
            where: {
                serviceCode: service_code,
                callingCode: prefix,
            }
        })

        for (let i = 0; i < operatorsetting.length; i++) {
            if (ui_number.startsWith(operatorsetting[i].startsWith)) {
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

        res.json(res_data)
    } catch (error) {
        console.log(error)
        res.json({
            status: "failed",
            msg: error
        })
    }

}

exports.BalanceTransfer = async (req, res, next) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
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

exports.userPortalBalance = async (username) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
    let mainBalance = 0.00;
    console.log(username)
    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })

    console.log(user)

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

    return actualbalance
}

exports.userGetPortalBalance = async (req, res, next) => {
    const { accessLog } = require('../authsrc/middlewares.js');
    accessLog.info(`GET PORTAL BALANCE|${JSON.stringify(req.body)}`)
    let username = req.body.username

    const actualbalance = await this.userPortalBalance(username)
    console.log(actualbalance);

    res.status(200).json({
        message: "portal balance request",
        data: username,
        balance: actualbalance
    })
}

exports.confirmRecharge = async (req, res, next) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
    let username = req.body.username
    let plan_amount = req.body.plan_amount
    let plan_id = req.body.plan_id
    let response = {}

    let debit_amount = 0.0

    const plan = await db.plans.findOne({
        where: {
            uuid: plan_id
        }
    })

    if (plan.credit_currency == plan.debit_currency) {
        debit_amount = parseInt(plan_amount)
    } else if (plan.is_range && plan.credit_currency != plan.debit_currency) {
        const currency = await db.currency.findOne({
            where: {
                credit_currency: plan.credit_currency,
                debit_currency: plan.debit_currency
            }
        })

        debit_amount = (parseInt(plan_amount) * currency.conversionValue).toFixed(2);

    } else {
        debit_amount = plan.debit_amount
    }

    let send_data = {
        "username": username
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

    if (actualbalance > debit_amount) {
        response = {
            status: "success",
            message: [{
                description: "Request Processing",
                code: 200
            }],
            debit_amount: debit_amount
        }
    } else {
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

// TODO
// API PRIORITY ORDER RESET FUNCTION
const apiPriority = (req, res, next) => {
    let plan_id = req.body.plan_id

}

const trxSuccess = async (purchase, debit_amount, api_name, trx_data, lockednumber_id, lockedBalance_id, percentvalue, user_uuid, trx_uuid, trx_api_id, network_uuid) => {

    if (purchase) {
        let upd_bal = purchase.purchase - parseFloat(debit_amount)

        const update_purchase = await db.purchase.update(
            {
                purchase: upd_bal
            },
            {
                where: {
                    dist: api_name
                }
            }
        )
    }

    const apitrx = await db.apitransaction.create(trx_data)

    const updateNumber = await db.lockednumber.update(
        {
            status: false,
        },
        {
            where: {
                id: lockednumber_id
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
                id: lockedBalance_id
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


    console.log("Agent Percentage : ", percentvalue);
    let earned = debit_amount / 100 * percentvalue

    const earnedData = {
        userId: user_uuid,
        amount: earned,
        trxId: trx_uuid
    }

    const agentEarning = await db.agentearning.create(earnedData)

    console.log("Agent Earned : ", agentEarning);

    const orgPercent = await db.apipercent.findOne({
        where: {
            apiId: trx_api_id,
            mobileId: network_uuid
        }
    })

    console.log("Organization Percent : ", orgPercent);
    let perc = 0.0
    if (orgPercent == null) {
        perc = 0.1
    } else {
        perc = orgPercent.percent
    }

    let orgCut = debit_amount / 100 * perc
    const orgEarnedData = {
        transactionId: trx_uuid,
        apiId: trx_api_id,
        cutAmount: orgCut
    }
    const orgEarning = await db.organizationearned.create(orgEarnedData)
    console.log("Organization earning : ", orgEarning);
}

const trxFailed = async (failed_bal, debit_amount, username, ui_number, network_name, api_name, api_profit, trx_id, user_uuid, trx_uuid, lockedNumber_id, lockedBalance_id) => {
    const sale_upd = await db.sales.create({
        balance: failed_bal,
        amount: -(parseFloat(debit_amount)),
        agent: username,
        number: ui_number,
        operator: network_name,
        api: api_name,
        profit: -(api_profit)
    })
    const upd_transaction = await db.transaction.update(
        {
            rechargeStatus: false
        },
        {
            where: {
                id: trx_id,
            }
        })

    const transfer = await db.agenttransaction.create({
        userId: user_uuid,
        transferedAmount: debit_amount,
        dedcutedAmount: 0.00,
        transactionId: trx_uuid
    })

    console.log("transaction returned");

    const updateNumber = await db.lockednumber.update(
        {
            status: false,
            trx_id: trx_uuid
        },
        {
            where: {
                id: lockedNumber_id
            }
        }
    )

    const updateBalance = await db.lockedbalance.update(
        {
            lockedStatus: false,
        },
        {
            where: {
                id: lockedBalance_id
            }
        }
    )
    console.log("RETURN TRASACTION CREATED > NUMBER UNLOCKED > BALANCE RETURNED")
    console.log("Balance Unavailable");
}

const successResponse = async(userbalance, debit_amount, api_id, sub_code, trx_id, api_code, trx_uuid, now, now) => {
    let apiResp = {
        status: "success",
        balance: (userbalance - debit_amount),
        api_trans_code: api_id,
        message: [{
            "description": "Transaction successfull",
            "code": "200",
        }],
        trans_id: sub_code + trx_id,
        trans_code: `${api_code}-${trx_uuid}`,
        trans_date: now,
        request_endtime: now
    }

    return apiResp
}

const failedResponse = async(userbalance, api_id, sub_code, trx_id, api_code, trx_uuid, now, now) => {
    let apiResp = {
        status: "failed",
        balance: userbalance,
        api_trans_code: api_id,
        message: [{
            "description": "Transaction was unsuccessfull",
            "code": "200",
        }],
        trans_id: sub_code + trx_id,
        trans_code: `${api_code}-${trx_uuid}`,
        trans_date: now,
        request_endtime: now
    }

    return apiResp
}

exports.recharge = async (req, res, next) => {
    const { logger, rechargeLivelogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
    accessLog.info(`ACCESS RECHARGE API|${JSON.stringify(req.body)}`)
    let data = {
        username: req.body.username,
        sub_operator_code: req.body.sub_operator_code,
        country_code: req.body.country_code,
        service_code: req.body.service_code,
        ui_number: req.body.ui_number,
        plan_amount: req.body.plan_amount,
        plan_id: req.body.plan_id,
        circle_code: req.body.circle_code,
        prefix: req.body.prefix,
        account_number: req.body.account_number
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
        debit_amount = Math.round((parseInt(data.plan_amount) * currency.conversionValue).toFixed(2));

        console.log("CONVERTED AMOUNT - ", debit_amount)
    } else if (!plan.is_range && plan.credit_currency != plan.debit_currency) {
        const currency = await db.currency.findOne({
            where: {
                credit_currency: plan.credit_currency,
                debit_currency: plan.debit_currency
            }
        })
        debit_amount = Math.round((parseInt(data.plan_amount) * currency.conversionValue).toFixed(2));
        console.log("CONVERTED AMOUNT - ", debit_amount)
    } else {
        debit_amount = plan.credit_amount
        console.log("CONVERTED AMOUNT - ", debit_amount)
    }

    if (lockedNumber.length > 0) {
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
        let lockinfo = `LOCKEDSTATUS: ${mobile}|LOCKED|${api.code}|RECHARGEFAILED`
        numberLockLogger.info(lockinfo)

        res.json(apiResp)

    } else {
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

        const transaction = await db.transaction.create(transaction_data)

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

        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT LOCKED|${api.code}|RECHARGEINITIATED`
        numberLockLogger.info(lockinfo)

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

        const percent = await db.agentpercentage.findOne({
            where: {
                userId: user.uuid,
            }
        })
        let percentCode = ""
        let percentvalue = 0.0
        if(api.code == "ETS"){
            percentCode = "ETS"
        }else if(api.code == "DU"){
            percentCode= "DU"
        }else {
            percentCode = "INT"
        }

        const percentdata = percent.percentdata
                
        for (let percentinfo of percentdata){
            if (percentCode in percentinfo){
                percentvalue = percentinfo[percentCode]
            }
        }

        // TODO
        let api_bal = 0.000
        let failed_bal = 0.000
        let api_profit = 0.000

        const purchase = await db.purchase.findOne({
            dist: api.name
        })

        if (purchase) {
            api_bal = purchase.purchase
            api_profit = parseFloat(debit_amount) / 100 * (purchase.commission - percentvalue)
        }

        console.log("api balance : ", api_bal)

        const sale = await db.sales.create({
            balance: api_bal,
            amount: parseFloat(debit_amount),
            agent: data.username,
            number: data.ui_number,
            operator: network.name,
            api: api.name,
            profit: api_profit
        })

        // ****************************************************
        // BALANCE COMPORAISON IF REQUESTED AMOUNT IS AVAILABLE
        // ****************************************************

        if(purchase.purchase > parseFloat(debit_amount)) {
            console.log("TRANSACTION EXECUTE")
            if (api.code == "LIV") {
                trx_data = {
                    transactionId: transaction.uuid,
                    apiId: api.uuid
                }
                trx_api_id = api.uuid
                trx_status = true
    
                if (trx_status) {
                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const successtrxresponse = await trxSuccess(purchase,debit_amount, api.name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                    numberLockLogger.info(lockinfo)

                    // apiResp = {
                    //     status: "success",
                    //     balance: (userbalance - debit_amount),
                    //     api_trans_code: api.id,
                    //     message: [{
                    //         "description": "Transaction successfull",
                    //         "code": "200",
                    //     }],
                    //     trans_id: data.sub_operator_code + transaction.id,
                    //     trans_code: `${api.code}-${transaction.uuid}`,
                    //     trans_date: now,
                    //     request_endtime: now
                    // }

                    const builtResponse = await successResponse(userbalance, debit_amount, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                    console.log(builtResponse)
                    logger.info(`${data.username} has recharged successfully in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                    res.json(builtResponse)
                } else {
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })


                    // MAKING A NEW FUNCTION

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)
                    // FUNCTION ENDS
                    // apiResp = {
                    //     status: "failed",
                    //     balance: userbalance,
                    //     api_trans_code: api.id,
                    //     message: [{
                    //         "description": "Transaction was unsuccessfull",
                    //         "code": "200",
                    //     }],
                    //     trans_id: data.sub_operator_code + transaction.id,
                    //     trans_code: `${api.code}-${transaction.uuid}`,
                    //     trans_date: now,
                    //     request_endtime: now
                    // }

                    const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                    console.log(builtResponse)
                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                    res.json(builtResponse)
                }
    
    
            } else if (api.code == "ETS") {
                trx_data = {
                    transactionId: transaction.uuid,
                    apiId: api.uuid
                }
                trx_api_id = api.uuid
                trx_status = true
                if (trx_status) {
                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const successtrxresponse = await trxSuccess(purchase,debit_amount, api.name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                    numberLockLogger.info(lockinfo)

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
                } else {
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })


                    // MAKING A NEW FUNCTION

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)
                    // FUNCTION ENDS
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
                }
    
            } else if (api.code == "DU") {
                trx_data = {
                    transactionId: transaction.uuid,
                    apiId: api.uuid
                }
                trx_api_id = api.uuid
                trx_status = false
                if (trx_status) {
                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const successtrxresponse = await trxSuccess(purchase,debit_amount, api.name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                    numberLockLogger.info(lockinfo)

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
                } else {
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })


                    // MAKING A NEW FUNCTION

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)
                    // FUNCTION ENDS
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
                }
    
            } else if (api.code == "RDY") {
                trx_data = {
                    transactionId: transaction.uuid,
                    apiId: api.uuid
                }
                trx_api_id = api.uuid
                trx_status = false
                if (trx_status) {
                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const successtrxresponse = await trxSuccess(purchase,debit_amount, api.name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                    numberLockLogger.info(lockinfo)

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
                } else {
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })


                    // MAKING A NEW FUNCTION

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)
                    // FUNCTION ENDS
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
                }
    
            } else if (api.code == "EZL") {
                trx_data = {
                    transactionId: transaction.uuid,
                    apiId: api.uuid
                }
                trx_api_id = api.uuid
                trx_status = true
                if (trx_status) {
                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const successtrxresponse = await trxSuccess(purchase,debit_amount, api.name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                    numberLockLogger.info(lockinfo)

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
                } else {
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })


                    // MAKING A NEW FUNCTION

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)
                    // FUNCTION ENDS
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
                }
    
            } else if (api.code == "DNG") {
                trx_data = {
                    transactionId: transaction.uuid,
                    apiId: api.uuid
                }
                trx_api_id = api.uuid
                trx_status = true
                if (trx_status) {
                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const successtrxresponse = await trxSuccess(purchase,debit_amount, api.name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                    numberLockLogger.info(lockinfo)

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
                } else {
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })


                    // MAKING A NEW FUNCTION

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)
                    // FUNCTION ENDS
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
                }
    
            } else if (api.code == "DTS") {
                trx_data = {
                    transactionId: transaction.uuid,
                    apiId: api.uuid
                }
                trx_api_id = api.uuid
                trx_status = false
                if (trx_status) {
                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const successtrxresponse = await trxSuccess(purchase,debit_amount, api.name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                    numberLockLogger.info(lockinfo)

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
                } else {
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })


                    // MAKING A NEW FUNCTION

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)
                    // FUNCTION ENDS
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
                }
    
            } else {
                console.log("********FAILED API RESPONSE************")
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })
    
                const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                numberLockLogger.info(lockinfo)

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
        }else{
            console.log("********API BALANCE NOT AVAILABLE************")
            const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
            const syslog = await db.systemlog.create({
                type: "Recharge",
                detail: logmsg
            })

            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api.name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
            numberLockLogger.info(lockinfo)
            apiResp = {
                status: "failed",
                balance: userbalance,
                api_trans_code: api.id,
                message: [{
                    "description": "Out Of Balance. Transaction Failed",
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
}