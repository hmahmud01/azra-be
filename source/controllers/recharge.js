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

exports.entries = async (data) => {
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
    const { rechargeOPPPINlogger } = require('../authsrc/middlewares.js');
    console.log("inside OPP PIN TEST")
    let type = "PinRequest"
    let terminal_id = "TESTOPP-1"
    let pass = "7AW85CL32R"
    let lang = "eng"
    let recepiept = "24009-014"
    let amount = "30"
    let clerk_id = 1
    let prodcode = "TSTSTC"
    // 49607

    // https://test.q3cloud.me:444/Web/Get?RequestXml=<RequestXml><Type>PinRequest</Type><TerminalId>TESTOPP-1</TerminalId><Password>7AW85CL32R</Password><Language>eng</Language><ReceiptNo>23005-059</ReceiptNo><ValueCode>30</ValueCode><ClerkId>1</ClerkId><RefNo>23005-059</RefNo><ProdCode>TSTSTC</ProdCode></RequestXml>    

    var url = `https://test.q3cloud.me:444/Web/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CValueCode%3E${amount}%3C/ValueCode%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`
    var config = {
        method: 'get',
        url: url,
        headers: {}
    };

    let msg = `PIN REQUEST | ${url}`
    rechargeOPPPINlogger.info(msg)

    axios(config)
        .then(function (response) {
            let output = response.data;
            var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            console.log(stringXML);
            console.log(response.data);
            console.log(JSON.stringify(stringXML))

            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(stringXML, "text/xml");
            let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;
            let Pin = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;

            if (parseInt(statusCode) == 1) {
                console.log("FAILED");
                res.json({
                    msg: "OPP PIN TEST Failed"
                })
                let msg = `FAILED RESPONSE | ${JSON.stringify(stringXML)}`
                rechargeOPPPINlogger.info(msg)
            } else {
                let Pin = xmlDoc.getElementsByTagName("Pin")[0].childNodes[0].nodeValue;
                console.log("succeed")
                let msg = `SUCCESS RESPONSE | ${JSON.stringify(stringXML)}`
                rechargeOPPPINlogger.info(msg)
                res.json({
                    msg: `PIN TEST SUCCEED ${Pin}`
                })
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

// TEST EZLOAD FUNCTIONS
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

exports.customerSales = async (username) => {
    let sales = 0.0000

    const salesentries = await db.sales.findAll({
        where: {
            agent: username
        }
    })

    for (let entry of salesentries) {
        sales += entry.amount
    }

    return sales
}

exports.userCollection = async (username) => {
    let collected = 0
    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })

    const settlements = await db.useramountsettlement.findAll({
        where: {
            userId: user.uuid
        }
    })

    for (let settle of settlements) {
        collected += settle.debit
    }

    return collected
}

exports.userCollectedAmount = async (username) => {
    const TRANSFER = "User Credit Amount Sent"
    const REDEEMED = "User Credit Redeemed"
    const COLLECTED = "User Credit withdrawn"

    let transferred = 0
    let collected = 0

    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })

    const settlements = await db.useramountsettlement.findAll({
        where: {
            userId: user.uuid
        }
    })

    for (settle of settlements) {
        transferred += settle.credit
        collected += settle.debit
    }

    let remaining = transferred - collected

    return remaining
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

    console.log("actual balance: ", actualbalance)

    if (actualbalance >= debit_amount) {
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

const saveResponse = async (response, trxId) => {
    const trxResp = await db.transactionresponse.create({
        transactionId: trxId,
        status: true,
        response: response
    })

    const salesreport = await saleReport(response);
    console.log("SALE UUID : ", salesreport);

    console.log("TRX RESPONSE: ", trxResp);

    return trxResp;
}

const saleReport = async (data) => {
    // utilize reportsalesModel.model.js
    const plan = ""
    const agent = ""
    const api = ""
    const profit = ""
    const sale = await db.sales.create({
        balance: 1000.0,
        amount: 250.66,
        agent: "agent",
        number: "016565654654",
        operator: "GP",
        api: "LIVE",
        profit: 95.416
    })

    return sale.uuid;
}

const apiPriority = (req, res, next) => {
    let plan_id = req.body.plan_id

}

const trxSuccess = async (apiamount, debit_amount, api_name, trx_data, lockednumber_id, lockedBalance_id, percentvalue, user_uuid, trx_uuid, trx_api_id, network_uuid) => {
    console.log("*********TRX SUCCESS*******************")
    if (apiamount) {
        let upd_bal = apiamount.purchase - parseFloat(debit_amount)
        console.log("******API PURCHASE NAME********")
        console.log(`API NAME : ${api_name}`)
        const update_purchase_api = await db.purchaseapi.update(
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

const successResponse = async(userbalance, debit_amount, api_id, sub_code, trx_id, api_code, trx_uuid, trans_now, req_now) => {
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
        trans_date: trans_now,
        request_endtime: req_now
    }

    return apiResp
}

const successPinResponse = async(userbalance, debit_amount, api_id, sub_code, trx_id, api_code, trx_uuid, trans_now, req_now, pin) => {
    let apiResp = {
        status: "success",
        balance: (userbalance - debit_amount),
        api_trans_code: api_id,
        message: [{
            "description": `Pin : ${pin}`,
            "code": "200",
        }],
        trans_id: sub_code + trx_id,
        trans_code: `${api_code}-${trx_uuid}`,
        trans_date: trans_now,
        request_endtime: req_now
    }

    return apiResp
}

const failedResponse = async(userbalance, api_id, sub_code, trx_id, api_code, trx_uuid, trans_now, req_now) => {
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
        trans_date: trans_now,
        request_endtime: req_now
    }

    return apiResp
}

exports.recharge = async (req, res, next) => {
    const { logger, rechargeLivelogger,rechargeOPPPINlogger, rechargeDulogger, rechargeETSlogger, rechargeEZLlogger, rechargeRDYlogger, numberLockLogger, accessLog } = require('../authsrc/middlewares.js');
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

    console.log("======PLAN=====")
    console.log(plan)

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

    console.log("========API=========")
    console.log(api)

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
        }else if(api.code == "OPPPIN") {
            percentCode= "Voucher"
        }else {
            percentCode = "INT"
        }

        console.log("*************CHECK PERCENT*************")
        console.log(`${api.code} - ${percentCode}`)

        const percentdata = percent.percentdata

        for (let percentinfo of percentdata) {
            if (percentCode in percentinfo) {
                percentvalue = percentinfo[percentCode]
            }
        }

        // TODO
        let api_bal = 0.000
        let failed_bal = 0.000
        let api_profit = 0.000


        // Add a temporary api name handler
        let api_purchase_name = ""

        if (api.code == "ETS"){
            api_purchase_name = "One-Prepay-Pin"
        }else if(api.code == "DU"){
            api_purchase_name = "One-Prepay-Pin"
        }else {
            api_purchase_name = api.name
        }

        console.log("**********CHECK API NAME AND API PURCHASE NAME****************")
        console.log(`API NAME : ${api.name} - API PURCHASE NAME ${api_purchase_name}`)
        const purchase = await db.purchase.findOne({
            where: {
                dist: api.name
            }
        })

        // need to filter with telco and api name for puchase commission

        // const purchase = await db.purchase.findOne({
        //     where: {
        //         telco: network.name,
        //         dist: api_purchase_name
        //     }
        // })

        const apiamount = await db.purchaseapi.findOne({
            where: {
                api: api_purchase_name
            }
        })

        console.log("========PURCHASE INFO ==========")
        console.log(purchase)

        if (apiamount) {
            api_bal = apiamount.purchase
            api_profit = parseFloat(debit_amount) / 100 * (purchase.commission - percentvalue)
        } else {
            console.log("********API BALANCE NOT PURCHASED************")
            const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
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

            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
            numberLockLogger.info(lockinfo)
            apiResp = {
                status: "failed",
                balance: userbalance,
                api_trans_code: api.id,
                message: [{
                    "description": "No Purchase on this API",
                    "code": "200",
                }],
                trans_id: data.sub_operator_code + transaction.id,
                trans_code: `${api.code}-${transaction.uuid}`,
                trans_date: now,
                request_endtime: now
            }
            res.json(apiResp)
        }

        console.log("******************checking api balance************")
        console.log("api balance : ", api_bal)

        const sale = await db.sales.create({
            balance: api_bal,
            amount: parseFloat(debit_amount),
            agent: data.username,
            number: data.ui_number,
            operator: network.name,
            api: api_purchase_name,
            profit: api_profit
        })

        // ****************************************************
        // BALANCE COMPORAISON IF REQUESTED AMOUNT IS AVAILABLE
        // ****************************************************

        if (purchase.purchase > parseFloat(debit_amount)) {
            console.log("TRANSACTION EXECUTE")
            if (api.code == "LIV") {
                // const apiResp = await rechargeModule.rechargeLive({plan, data, plan_type, network, api, transaction});
                console.log("inside LIVE API")
                const apiurl = process.env.LIV
                const apikey = process.env.LIV_APIKEY
                const client_id = process.env.LIV_CLIENT_ID
                const transaction_id = '00' + transaction.id
                const msisdn = mobile
                const sendAmount = plan.credit_amount
                let operator = ""

                if (network.name == "Grameenphone") {
                    operator = "grameen"
                } else if (network.name == "Banglalink") {
                    operator = "banglalink"
                } else if (network.name == "Airtel") {
                    operator = "airtel"
                } else if (network.name == "Robi") {
                    operator = "robi"
                }

                const send_data = {
                    "data": {
                        "msisdn": msisdn,
                        "amount": parseInt(req.body.plan_amount),
                        "transaction_id": transaction_id,
                        "client_id": client_id,
                        "operator": operator
                    }
                }

                let loglivereq = `LIVE REQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(send_data)}`
                rechargeLivelogger.info(loglivereq)

                console.log(`MSISDN : ${msisdn}`)
                console.log(`RECHARGE AMOUNT : ${parseInt(req.body.plan_amount)}`)
                const apiCall = await fetch(apiurl, {
                    method: 'POST',
                    headers: {
                        'x-api-key': apikey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(send_data),
                })
                    .then(response => response.json())
                    .then(async livedata => {
                        let logliveres = `LIVE RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(livedata)}`
                        rechargeLivelogger.info(logliveres)
                        console.log("data from live : ", livedata)
                        // const resp = await saveResponse(data, transaction.id);
                        // console.log(resp);
                        if (livedata.status == "success") {
                            trx_data = {
                                transactionId: transaction.uuid,
                                apiId: api.uuid
                            }
                            trx_api_id = api.uuid
                            trx_status = true
                        }

                        if (trx_status) {
                            const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                            const syslog = await db.systemlog.create({
                                type: "Recharge",
                                detail: logmsg
                            })

                            const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                            numberLockLogger.info(lockinfo)

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

                            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                            numberLockLogger.info(lockinfo)

                            const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                            console.log(builtResponse)
                            logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)
                        }
                    })
                    .catch(async e => {
                        console.log(e);
                        console.log("LIVE DIDNT WORK");
                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                        numberLockLogger.info(lockinfo)

                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    })

                // TRANSACTION RECORDS
                console.log("Transaction Data : ", trx_data);
                console.log("Api ID: ", trx_api_id);
                console.log("Transaction Status : ", trx_status);

            } else if (api.code == "OPPPIN") {
                let today = new Date().toISOString().split('T')[0]
                console.log("inside OPP PIN TEST")
                let type = "PinRequest"
                let terminal_id = "TESTOPP-1"
                let pass = "7AW85CL32R"
                let lang = "eng"
                let recepiept = today + transaction.id
                let amount = debit_amount
                let clerk_id = 1
                let prodcode = plan.productcode
                
                // var url = `https://test.q3cloud.me:444/Web/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CValueCode%3E${amount}%3C/ValueCode%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`
                var url = `hhttps://uae.q3cloud.me:545/Web/Get?RequestXml=%3CRequestXml%3E%3CType%3E${type}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CValueCode%3E${amount}%3C/ValueCode%3E%3CClerkId%3E${clerk_id}%3C/ClerkId%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3C/RequestXml%3E`
                var config = {
                    method: 'get',
                    url: url,
                    headers: {}
                };

                let msg = `PIN REQUEST | ${data.username} | ${url}`
                rechargeOPPPINlogger.info(msg)


                axios(config)
                    .then(async function (response) {
                        let output = response.data;
                        var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                        console.log(stringXML);

                        let parser = new DOMParser();
                        let xmlDoc = parser.parseFromString(stringXML, "text/xml");
                        let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;

                        if (parseInt(statusCode) == 1) {
                            console.log("FAILED");
                            let msg = `FAILED RESPONSE | ${JSON.stringify(stringXML)}`
                            rechargeOPPPINlogger.info(msg)
                            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                            const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                            console.log(builtResponse)
                            logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)
                        } else {
                            let pin = xmlDoc.getElementsByTagName("Pin")[0].childNodes[0].nodeValue;
                            console.log("succeed")
                            const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                            let msg = `SUCCESS RESPONSE | CUSTOMER: ${data.username} | PIN: ${pin} | ${JSON.stringify(stringXML)}`
                            rechargeOPPPINlogger.info(msg)
                            const builtResponse = await successPinResponse(userbalance, debit_amount, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now, pin)
                            console.log(builtResponse)
                            logger.info(`${data.username} has recharged successfully in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)
                        }
                    })
                    .catch(async function (error) {
                        console.log("FAILED");
                        let msg = `FAILED RESPONSE | ${JSON.stringify(stringXML)}`
                        rechargeOPPPINlogger.info(msg)
                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    });
            } else if (api.code == "ETS") {
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

                let logetsreq1 = `ETS RECHARGEINITILIZEREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${xml_data}`
                rechargeETSlogger.info(logetsreq1)

                axios(config)
                    .then(async function (response) {
                        let output = response.data;
                        var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                        console.log(stringXML);
                        console.log(response.data);
                        let logetsres1 = `ETS RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(stringXML)}`
                        rechargeETSlogger.info(logetsres1)
                        let parser = new DOMParser();
                        let xmlDoc = parser.parseFromString(stringXML, "text/xml");
                        let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;

                        if (parseInt(statusCode) == 1) {
                            console.log("FAILED");
                            const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                            const syslog = await db.systemlog.create({
                                type: "Recharge",
                                detail: logmsg
                            })

                            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                            numberLockLogger.info(lockinfo)

                            const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                            console.log(builtResponse)
                            logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)
                        } else {
                            console.log("SUCCEED");
                            let step = "PinlessRequest2ndStep"
                            var config = {
                                method: 'get',
                                url: `${url}/Get?RequestXml=%3CRequestXml%3E%3CType%3E${step}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3CAmount%3E${amount}%3C/Amount%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3C/RequestXml%3E`,
                                headers: {}
                            };

                            let logetsreq2 = `ETS RECHARGECONFIRMREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${config.url}}`
                            rechargeETSlogger.info(logetsreq2)

                            await axios(config)
                                .then(async function (response) {
                                    let output = response.data;
                                    var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                                    console.log(stringXML);
                                    console.log(response.data);

                                    let logetsres2 = `ETS RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${stringXML}}`
                                    rechargeETSlogger.info(logetsres2)

                                    let parser = new DOMParser();
                                    let xmlDoc = parser.parseFromString(stringXML, "text/xml");
                                    let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;
                                    let statusDesc = xmlDoc.getElementsByTagName("StatusDescription")[0].childNodes[0].nodeValue;
                                    let transNo = xmlDoc.getElementsByTagName("TransNo")[0].childNodes[0].nodeValue;
                                    let transDate = xmlDoc.getElementsByTagName("TransDate")[0].childNodes[0].nodeValue;
                                    let balance = xmlDoc.getElementsByTagName("Balance")[0].childNodes[0].nodeValue;

                                    console.log(`Trx made for ${statusCode} ${statusDesc} ${transNo} ${transDate} ${balance}`)

                                    if (parseInt(statusCode) == 1) {
                                        console.log("RECHARGE FAILED")
                                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                        const syslog = await db.systemlog.create({
                                            type: "Recharge",
                                            detail: logmsg
                                        })

                                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                                        numberLockLogger.info(lockinfo)

                                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                        console.log(builtResponse)
                                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                        res.json(builtResponse)

                                    } else if (parseInt(statusCode) == 0) {
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
                    
                                        const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                                        numberLockLogger.info(lockinfo)
                    
                                        const builtResponse = await successResponse(userbalance, debit_amount, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                        console.log(builtResponse)
                                        logger.info(`${data.username} has recharged successfully in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                        res.json(builtResponse)
                                    }
                                })
                                .catch(async function (error) {
                                    console.log(error);
                                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                    const syslog = await db.systemlog.create({
                                        type: "Recharge",
                                        detail: logmsg
                                    })
            
                                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                                    numberLockLogger.info(lockinfo)
            
                                    const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                    console.log(builtResponse)
                                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                    res.json(builtResponse)
                                });
                        }

                    })
                    .catch(async function (error) {
                        console.log(error);
                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                        numberLockLogger.info(lockinfo)

                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    });

            } else if (api.code == "DU") {
                console.log("==================================")
                console.log("inside DU TEST FOR ONEPREPAY")
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
                let prodcode = "DUCTOP"
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

                let logdureq = `DU RECHARGEINITILIZEREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${xml_data}`
                rechargeDulogger.info(logdureq)

                axios(config)
                    .then(async function (response) {
                        let output = response.data;
                        var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                        console.log(stringXML);
                        console.log(response.data);
                        let logdures = `DU RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${stringXML}`
                        rechargeDulogger.info(logdures)
                        let parser = new DOMParser();
                        let xmlDoc = parser.parseFromString(stringXML, "text/xml");
                        let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;

                        if (parseInt(statusCode) == 1) {
                            console.log("FAILED");
                            const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                            const syslog = await db.systemlog.create({
                                type: "Recharge",
                                detail: logmsg
                            })

                            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                            numberLockLogger.info(lockinfo)

                            const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                            console.log(builtResponse)
                            logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)
                        } else {
                            console.log("SUCCEED");
                            let step = "PinlessRequest2ndStep"
                            var config = {
                                method: 'get',
                                url: `${url}/Get?RequestXml=%3CRequestXml%3E%3CType%3E${step}%3C/Type%3E%3CTerminalId%3E${terminal_id}%3C/TerminalId%3E%3CPassword%3E${pass}%3C/Password%3E%3CLanguage%3E${lang}%3C/Language%3E%3CProdCode%3E${prodcode}%3C/ProdCode%3E%3CAmount%3E${amount}%3C/Amount%3E%3CReceiptNo%3E${recepiept}%3C/ReceiptNo%3E%3CRefNo%3E${recepiept}%3C/RefNo%3E%3C/RequestXml%3E`,
                                headers: {}
                            };

                            let logdureq2 = `DU RECHARGECONFIRMREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${config.url}}`
                            rechargeDulogger.info(logdureq2)

                            await axios(config)
                                .then(async function (response) {
                                    let output = response.data;
                                    var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                                    console.log(stringXML);
                                    console.log(response.data);

                                    let logdures2 = `DU RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${stringXML}}`
                                    rechargeDulogger.info(logdures2)

                                    let parser = new DOMParser();
                                    let xmlDoc = parser.parseFromString(stringXML, "text/xml");
                                    let statusCode = xmlDoc.getElementsByTagName("StatusCode")[0].childNodes[0].nodeValue;
                                    let statusDesc = xmlDoc.getElementsByTagName("StatusDescription")[0].childNodes[0].nodeValue;
                                    let transNo = xmlDoc.getElementsByTagName("TransNo")[0].childNodes[0].nodeValue;
                                    let transDate = xmlDoc.getElementsByTagName("TransDate")[0].childNodes[0].nodeValue;
                                    let balance = xmlDoc.getElementsByTagName("Balance")[0].childNodes[0].nodeValue;

                                    console.log(`Trx made for ${statusCode} ${statusDesc} ${transNo} ${transDate} ${balance}`)

                                    if (parseInt(statusCode) == 1) {
                                        console.log("========RECHARGE FAILED =================")
                                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                        const syslog = await db.systemlog.create({
                                            type: "Recharge",
                                            detail: logmsg
                                        })

                                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                                        numberLockLogger.info(lockinfo)

                                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                        console.log(builtResponse)
                                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                        res.json(builtResponse)

                                    } else if (parseInt(statusCode) == 0) {
                                        console.log("========RECHARGE SUCCESS =================")
                                        // const resp = await saveResponse(data, transaction.id, api.code);
                                        trx_data = {
                                            transactionId: transaction.uuid,
                                            apiId: api.uuid
                                        }
                                        trx_api_id = api.uuid
                                        trx_status = true

                                        console.log("LOGGIN")

                                        const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                        const syslog = await db.systemlog.create({
                                            type: "Recharge",
                                            detail: logmsg
                                        })

                                        const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                                        numberLockLogger.info(lockinfo)

                                        const builtResponse = await successResponse(userbalance, debit_amount, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                        console.log(builtResponse)
                                        logger.info(`${data.username} has recharged successfully in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                        res.json(builtResponse)
                                    }
                                })
                                .catch(async function (error) {
                                    console.log(error);
                                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                    const syslog = await db.systemlog.create({
                                        type: "Recharge",
                                        detail: logmsg
                                    })
            
                                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                                    numberLockLogger.info(lockinfo)
            
                                    const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                    console.log(builtResponse)
                                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                    res.json(builtResponse)
                                });
                        }

                    })
                    .catch(async function (error) {
                        console.log(error);
                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                        numberLockLogger.info(lockinfo)

                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    });


            } else if (api.code == "RDY") {
                console.log("=========\nRDY CONNECTE\n===========");

                const apiUrl = "https://www.rechargedaddy.in/RDRechargeAPI/RechargeAPI.aspx"
                const checkUrl = "https://www.rechargedaddy.in/RDRechargeAPI/RechargeAPI.aspx"
                let refno = "RDY - " + transaction.uuid

                let sercode = ""

                if (network.name == "Airtel") {
                    sercode = "AR"
                } else if (network.name == "BSNL") {
                    sercode = "BS"
                } else if (network.name == "Vodafone") {
                    sercode = "VF"
                } else if (network.name == "Idea") {
                    sercode = "ID"
                }

                let resData = qs.stringify({
                    "MobileNo": "9947539329",
                    "APIKey": "Ye8AfUFGIgicYRTqKHFaHe2f1duYrEz4gHq",
                    "REQTYPE": "RECH",
                    "REFNO": refno,
                    "SERCODE": sercode,
                    "CUSTNO": data.ui_number,
                    "AMT": parseInt(data.plan_amount),
                    "STV": 0,
                    "RESPTYPE": "JSON"
                })

                console.log("DATA RESPONSE FOR RDY FIRST API : ", resData)


                let config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: apiUrl,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: resData
                };

                let logrdreq = `RDY RECHARGEREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(resData)}`
                rechargeRDYlogger.info(logrdreq)

                const rdyapi = await axios.request(config)
                console.log("RDY API HIT", rdyapi)
                if (rdyapi) {
                    console.log("API HIT DONE. CHECKING TRX")
                    // console.log(apidata);
                    let checkData = qs.stringify({
                        "MobileNo": "9947539329",
                        "APIKey": "Ye8AfUFGIgicYRTqKHFaHe2f1duYrEz4gHq",
                        "REQTYPE": "STATUS",
                        "REFNO": refno,
                        "RESPTYPE": "JSON"
                    })

                    let logrdres = `RDY RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(rdyapi.data)}`
                    rechargeRDYlogger.info(logrdres)

                    let config2 = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        url: checkUrl,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: checkData
                    };

                    let logrdreq2 = `RDY TRXCHECKREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(checkData)}`
                    rechargeRDYlogger.info(logrdreq2)

                    const rdyapi2 = await axios.request(config2)
                    if (rdyapi2) {
                        console.log("2nd API HIT RDY : ", rdyapi2);
                        // {"STATUSCODE":"0","STATUSMSG":"Success","REFNO":"02RDYU2906","TRNID":28099563,"TRNSTATUS":1,"TRNSTATUSDESC":"Success","OPRID":"MHR2305291527260020"}
                        const respMsg = `StatusCode: ${rdyapi2.data.STATUSCODE}, StatusMSG: ${rdyapi2.data.STATUSMSG} , REFNO: ${rdyapi2.data.REFNO} , TRNID: ${rdyapi2.data.TRNID} , TRNSTATUS : ${rdyapi2.data.TRNSTATUS} , OPRID : ${rdyapi2.data.OPRID}`
                        // const resp = await saveResponse(respMsg, data.TRNID)
                        let logrdres2 = `RDY RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(rdyapi2.data)}`
                        rechargeRDYlogger.info(logrdres2)
                        if (rdyapi2.data.STATUSMSG == "Success") {
                            trx_data = {
                                transactionId: transaction.uuid,
                                apiId: api.uuid
                            }
                            trx_api_id = api.uuid
                            trx_status = true
                        }
                        if (trx_status) {
                            const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                            const syslog = await db.systemlog.create({
                                type: "Recharge",
                                detail: logmsg
                            })

                            const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                            numberLockLogger.info(lockinfo)

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

                            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                            numberLockLogger.info(lockinfo)

                            const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                            console.log(builtResponse)
                            logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)
                        }
                    } else {
                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                        numberLockLogger.info(lockinfo)

                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    }
                } else {
                    // res.json({
                    //     msg: "RECHARGE DADDY API HIT FAILED"
                    // })
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)

                    const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                    console.log(builtResponse)
                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                    res.json(builtResponse)
                }

                // TRANSACTION RECORDS
                console.log("Transaction Data : ", trx_data);
                console.log("Api ID: ", trx_api_id);
                console.log("Transaction Status : ", trx_status);


            } else if (api.code == "EZL") {
                console.log("=========\nEZL CONNECTE\n===========");
                let serviceId = 0

                const apiUrl = "https://payments-central.com/api/User/Transaction"
                const checkUrl = "https://payments-central.com/api/User/TransactionCheck"

                // const phonenumber = data.prefix + data.ui_number
                const phonenumber = data.ui_number

                if (network.name == WARID) {
                    serviceId = 19
                } else if (network.name == MOBILINK) {
                    serviceId = 17
                } else if (network.name == JAZZ) {
                    serviceId = 17
                } else if (network.name == TELENOR) {
                    serviceId = 18
                } else if (network.name == ZONG) {
                    serviceId = 20
                } else if (network.name == UFONE) {
                    serviceId = 16
                }

                // phonenumber can be with prefix or not
                const send_data = {
                    "SessionId": "aaead679d0aa42acbc43a62a154279a2",
                    "ServiceId": 3,
                    "Input": {
                        "Amount": parseInt(req.body.plan_amount),
                        "PhoneNumber": phonenumber
                    },
                    "Reference": "EZL-" + transaction.uuid
                }

                var querydata = JSON.stringify({
                    "SessionId": "aaead679d0aa42acbc43a62a154279a2",
                    "ServiceId": serviceId,
                    "Input": {
                        "Amount": parseInt(req.body.plan_amount),
                        "PhoneNumber": phonenumber
                    },
                    "Reference": "EZL-" + transaction.uuid
                });

                var config = {
                    method: 'post',
                    url: apiUrl,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: querydata
                };


                let logezlreq = `EZL RECHARGEREQUEST|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${querydata}`
                rechargeEZLlogger.info(logezlreq)
                console.log("BILLING REQUEST : ", logezlreq)

                const apicall = await axios(config)
                if (apicall) {
                    let trxId = apicall.data.TransactionId
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

                    console.log("RESPONSE : ", apicall.data)
                    console.log("STRINGIFY RESPONSE : ", JSON.stringify(apicall.data))

                    let logezlres = `EZL RESPONSE|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${JSON.stringify(apicall.data)}`
                    rechargeEZLlogger.info(logezlres)

                    console.log(logezlres)

                    let logezlreq2 = `EZL TRXCHECKREQUEST|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${trxcheck}`
                    rechargeEZLlogger.info(logezlreq2)

                    console.log("TRX CHECK REQUEST : ", trxcheck)
                    console.log(logezlreq2)

                    const ezlCheck = await axios(config2)


                    if (ezlCheck) {
                        let trxMsg = `TransactionStatusCode : ${ezlCheck.data.TransactionStatusCode} , TransactionStatusName : ${ezlCheck.data.TransactionStatusName} , Message: ${ezlCheck.data.Message}`
                        // const resp = await saveResponse(trxMsg, trxId);
                        if (ezlCheck.data.TransactionStatusName == "Successful") {
                            trx_data = {
                                transactionId: transaction.uuid,
                                apiId: api.uuid
                            }
                            trx_api_id = api.uuid
                            trx_status = true
                        } else if (ezlCheck.data.TransactionStatusName == "Unsuccessful") {
                            trx_data = {
                                transactionId: transaction.uuid,
                                apiId: api.uuid
                            }
                            trx_api_id = api.uuid
                            trx_status = false
                        } else {
                            // check for 2nd api call with a timeout
                            console.log("DONE")
                        }

                        console.log("TRX CHECK RESPONSE : ", ezlCheck.data)
                        console.log("STRINGIFY RESPONSE : ", JSON.stringify(ezlCheck.data))
                        let logezlres2 = `EZL RESPONSE|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${JSON.stringify(ezlCheck.data)}`
                        rechargeEZLlogger.info(logezlres2)

                        if (trx_status) {
                            const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                            const syslog = await db.systemlog.create({
                                type: "Recharge",
                                detail: logmsg
                            })

                            const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                            numberLockLogger.info(lockinfo)

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

                            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                            numberLockLogger.info(lockinfo)

                            const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                            console.log(builtResponse)
                            logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)
                        }
                    } else {
                        // res.json({
                        //     msg: "EZLOADAPI CHECK NOT WORKING"
                        // })
                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                        numberLockLogger.info(lockinfo)

                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    }
                } else {
                    // res.json({
                    //     msg: "EZLOADAPI DIDNt work"
                    // })
                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                    const syslog = await db.systemlog.create({
                        type: "Recharge",
                        detail: logmsg
                    })

                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                    numberLockLogger.info(lockinfo)

                    const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                    console.log(builtResponse)
                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                    res.json(builtResponse)
                }
                // TRANSACTION RECORDS
                console.log("Transaction Data : ", trx_data);
                console.log("Api ID: ", trx_api_id);
                console.log("Transaction Status : ", trx_status);

            } else if (api.code == "DNG") {
                console.log("inside DING API")
                const priceurl = process.env.DNG_PRICE
                const apiurl = process.env.DNG_API
                const apikey = process.env.DNG_APIKEY
                const transaction_id = transaction.uuid
                const account = data.prefix + data.ui_number
                const dingplan = await db.planding.findOne({
                    where: {
                        plan_id: data.plan_id
                    }
                })

                const estimate_data = [{
                    SkuCode: dingplan.skucode,
                    SendValue: 0,
                    ReceiveCurrencyIso: dingplan.receive_currency,
                    ReceiveValue: dingplan.receive_amount,
                    BatchItemRef: "string"
                }]

                const header = {
                    'api_key': apikey,
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }

                fetch(priceurl, {
                    method: 'POST',
                    headers: header,
                    body: JSON.stringify(estimate_data)
                })
                    .then(response => response.json())
                    .then(async respdata => {
                        console.log("SKU DATA CHECK SUCCESS *******************")
                        console.log(respdata)
                        const send_data = {
                            SkuCode: dingplan.skucode,
                            SendValue: respdata.Items[0].Price.SendValue,
                            AccountNumber: account,
                            DistributorRef: "AZRAPAY",
                            ValidateOnly: false
                        }

                        console.log("SEND DATA **************************************")
                        console.log(send_data);

                        fetch(apiurl, {
                            method: 'POST',
                            headers: header,
                            body: JSON.stringify(send_data)
                        })
                            .then(response => response.json())
                            .then(async resp => {
                                console.log("API HIT SUCCESS")
                                console.log(resp)
                                let trxMsg = `Transaction Status`
                                // const resp = saveResponse(trxMsg, transaction.id);
                                trx_data = {
                                    transactionId: transaction.uuid,
                                    apiId: api.uuid
                                }
                                trx_api_id = api.uuid
                                trx_status = true

                                if (resp.TransferRecord.ProcessingState == 'Complete') {
                                    trx_status = true
                                } else if (resp.TransferRecord.ProcessingState == 'Failed') {
                                    trx_status = false
                                }

                                if (trx_status) {
                                    const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                    const syslog = await db.systemlog.create({
                                        type: "Recharge",
                                        detail: logmsg
                                    })

                                    const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                                    numberLockLogger.info(lockinfo)

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

                                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                                    numberLockLogger.info(lockinfo)

                                    const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                    console.log(builtResponse)
                                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                    res.json(builtResponse)
                                }

                            })
                            .catch(e => {
                                console.log(e);
                                console.log("DNG api url not working")
                            })
                    })
                    .catch(async e => {
                        console.log(e);
                        console.log("DNG Price check url didn't work")
                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                        numberLockLogger.info(lockinfo)

                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    })

                console.log("Transaction Data : ", trx_data);
                console.log("Api ID: ", trx_api_id);
                console.log("Transaction Status : ", trx_status);

            } else if (api.code == "DTS") {


                // const apiResp = await rechargeModule.rechargeLive({plan, data, plan_type, network, api, transaction});


                console.log("inside DTS API")

                const apiurl = "https://dvs-api.dtone.com";
                const apikey = "Basic YmZmM2ZkMmItZmRiNS00MmUyLTk0NDUtY2FjNDJiNzYyOWNjOjAwOTMxZTBmLThjOWItNGE0Mi1hMTE2LTUwOTAyNmRiOGU5OQ==";
                // const apiurl = "https://preprod-dvs-api.dtone.com";
                // const apikey = "Basic ZjdiMmIyMzItYTk4ZC00NzU0LWFhOGEtODY5NGQ1ZmQyZDc0OjFjNDRiNWE5LWQ5YTctNDU1MC05YmQzLTAzNDVkMDQ1MzJkNA==";

                const client_id = process.env.LIV_CLIENT_ID
                const transaction_id = '00' + transaction.id
                const msisdn = mobile
                const sendAmount = debit_amount;
                const product_id = plan.productcode;
                let operator = "";


                if (network.name == "Jazz") {
                    operator = "Jazz Pakistan"
                }

                let dtsdata = JSON.stringify({
                    "external_id": transaction_id,
                    "product_id": product_id,
                    "credit_party_identifier": {
                        "mobile_number": `+${msisdn}`
                    }
                });
                console.log("PLAN DETAIL : ", plan)

                if (plan.is_range && (plan.rechargeType == "cards" || plan.rechargeType == "MR")) {
                    dtsdata = JSON.stringify({
                        "external_id": transaction_id,
                        "product_id": product_id,
                        "calculation_mode": "SOURCE_AMOUNT",
                        "source":
                        {
                            "unit_type": "CURRENCY",
                            "unit": "AED",
                            "amount": sendAmount
                        },
                        "credit_party_identifier": {
                            "mobile_number": `+${msisdn}`
                        }
                    });
                }


                if (plan.is_range && plan.rechargeType == "UTILITY") {
                    dtsdata = JSON.stringify({
                        "external_id": transaction_id,
                        "product_id": product_id,
                        "calculation_mode": "SOURCE_AMOUNT",
                        "source":
                        {
                            "unit_type": "CURRENCY",
                            "unit": "AED",
                            "amount": sendAmount
                        },
                        "credit_party_identifier": {
                            "account_number": data.account_number,
                            "mobile_number": `+${msisdn}`
                        }
                    });
                }


                let loglivereq = `DTS REQUEST|${product_id}|${msisdn}|${transaction.uuid}|${api.code}|${JSON.stringify(dtsdata)}`
                rechargeLivelogger.info(loglivereq)

                console.log(`MSISDN : ${msisdn}`)
                console.log(`RECHARGE AMOUNT : ${parseInt(req.body.plan_amount)}`)

                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${apiurl}/v1/async/transactions`,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${apikey}`
                    },
                    data: dtsdata
                };

                axios.request(config)
                    .then(async (response) => {
                        console.log("TRANSACTION CREATED RESPONSE : ", response.data)
                        if (response.data.status.class.message == "CREATED") {
                            let config_confirm = {
                                method: 'post',
                                maxBodyLength: Infinity,
                                url: `${apiurl}/v1/async/transactions/${response.data.id}/confirm`,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `${apikey}`
                                }
                            };

                            await axios.request(config_confirm)
                                .then(async (response) => {

                                    console.log(JSON.stringify("TRANSACTION CONFIRM RESPONSE: ", response.data));
                                    //res.json({message : response.data.status.class.message})


                                    let logliveres = `DTS RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(response.data)}`
                                    rechargeLivelogger.info(logliveres)
                                    console.log("data from live : ", response.data)

                                    if (response.data.status.class.message == "CONFIRMED") {
                                        trx_data = {
                                            transactionId: transaction.uuid,
                                            apiId: api.uuid
                                        }
                                        trx_api_id = api.uuid
                                        trx_status = true
                                    }

                                    if (trx_status) {
                                        const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                        const syslog = await db.systemlog.create({
                                            type: "Recharge",
                                            detail: logmsg
                                        })

                                        const successtrxresponse = await trxSuccess(apiamount,debit_amount, api_purchase_name, trx_data, lockedNumber.id, lockedBalance.id, percentvalue, user.uuid, transaction.uuid, trx_api_id, network.uuid)
                                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                                        numberLockLogger.info(lockinfo)

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

                                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                                        numberLockLogger.info(lockinfo)

                                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                        console.log(builtResponse)
                                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                        res.json(builtResponse)
                                    }

                                })
                                .catch(async (error) => {
                                    console.log(error);
                                    const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                    const syslog = await db.systemlog.create({
                                        type: "Recharge",
                                        detail: logmsg
                                    })

                                    const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                                    numberLockLogger.info(lockinfo)

                                    const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                                    console.log(builtResponse)
                                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                    res.json(builtResponse)
                                });
                        } else {
                            const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                            const syslog = await db.systemlog.create({
                                type: "Recharge",
                                detail: logmsg
                            })

                            const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                            let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                            numberLockLogger.info(lockinfo)

                            const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                            console.log(builtResponse)
                            logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                            res.json(builtResponse)

                            //res.json({message : response.data.status.class.message})
                        }
                    })
                    .catch(async (error) => {
                        console.log(error);
                        const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                        numberLockLogger.info(lockinfo)

                        const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                        console.log(builtResponse)
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(builtResponse)
                    });



                // TRANSACTION RECORDS
                console.log("Transaction Data : ", trx_data);
                console.log("Api ID: ", trx_api_id);
                console.log("Transaction Status : ", trx_status);
            } else {
                console.log("********FAILED API RESPONSE************")
                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                const syslog = await db.systemlog.create({
                    type: "Recharge",
                    detail: logmsg
                })

                const trxfailedresponse = await trxFailed(failed_bal, debit_amount, data.username, data.ui_number, network.name, api_purchase_name, api_profit, transaction.id, user.uuid, transaction.uuid, lockedNumber.id, lockedBalance.id)
                let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE FAILED`
                numberLockLogger.info(lockinfo)

                const builtResponse = await failedResponse(userbalance, api.id, data.sub_operator_code, transaction.id, api.code, transaction.uuid, now, now)
                console.log(builtResponse)
                logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                res.json(builtResponse)
            }
        } else {
            console.log("********API BALANCE NOT AVAILABLE************")
            const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
            const syslog = await db.systemlog.create({
                type: "Recharge",
                detail: logmsg
            })

            const sale_upd = await db.sales.create({
                balance: failed_bal,
                amount: -(parseFloat(debit_amount)),
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