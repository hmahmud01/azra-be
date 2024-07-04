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
          'Authorization': 'Basic ZjdiMmIyMzItYTk4ZC00NzU0LWFhOGEtODY5NGQ1ZmQyZDc0OjFjNDRiNWE5LWQ5YTctNDU1MC05YmQzLTAzNDVkMDQ1MzJkNA=='
        },
        data : data
      };
      
      axios.request(config)
      .then(async (response) => {
        console.log(JSON.stringify(response.data));
           
                            if(response.data.status.class.message=="CREATED"){
                                let config_confirm = {
                                    method: 'post',
                                    maxBodyLength: Infinity,
                                    url: `https://preprod-dvs-api.dtone.com/v1/async/transactions/${response.data.id}/confirm`,
                                    headers: { 
                                        'Content-Type': 'application/json', 
                                        'Authorization': 'Basic ZjdiMmIyMzItYTk4ZC00NzU0LWFhOGEtODY5NGQ1ZmQyZDc0OjFjNDRiNWE5LWQ5YTctNDU1MC05YmQzLTAzNDVkMDQ1MzJkNA=='
                                      }
                                  };


                                  await axios.request(config_confirm)
                                  .then(async (response) => {
                                  
                                      console.log(JSON.stringify(response.data));
                                      res.json({message : response.data.status.class.message})

                                      if(response.data.status.class.message == "CONFIRMED"){

                                      }
                                  })
                                  .catch((error) => {
                                    console.log(error);
                                  });
                            }else{
                                res.json({message : response.data.status.class.message})
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
    // let mainBalance = 0.00;
    // const user = await db.user.findOne({
    //     where: {
    //         phone: username
    //     }
    // })

    // const agentTrx = await db.agenttransaction.findAll({
    //     where: {
    //         userId: user.uuid
    //     }
    // })

    // for (let i = 0; i < agentTrx.length; i++) {
    //     mainBalance = mainBalance + agentTrx[i].transferedAmount - agentTrx[i].dedcutedAmount
    // }

    // console.log(`main balance from trasaction calculation , ${mainBalance}`)
    // const lockedbalances = await db.lockedbalance.findAll({
    //     where: {
    //         lockedStatus: true,
    //         userId: user.uuid
    //     }
    // })

    // let pendingRecharge = 0.00

    // for (let i = 0; i < lockedbalances.length; i++) {
    //     pendingRecharge += lockedbalances[i].amountLocked
    // }

    // console.log(`Pending Balance: ${pendingRecharge}`);
    // let actualbalance = mainBalance - pendingRecharge

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

        // TODO
        let api_bal = 0.000
        let failed_bal = 0.000
        let api_profit = 0.000

        const purchase = await db.purchase.findOne({
            dist: api.name
        })

        if (purchase) {
            api_bal = purchase.purchase
            api_profit = purchase.commission / 100 * parseFloat(data.plan_amount)
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

            let loglivereq = `REQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(send_data)}`
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
                    let logliveres = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(livedata)}`
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

                        if (purchase) {
                            let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)

                            const update_purchase = await db.purchase.update(
                                {
                                    purchase: upd_bal
                                },
                                {
                                    where: {
                                        dist: api.name
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
                                    id: lockedNumber.id
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
                                    id: lockedBalance.id
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
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                        numberLockLogger.info(lockinfo)
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
                    } else {
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
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(apiResp)
                    }
                })
                .catch(e => {
                    console.log(e);
                    console.log("LIVE DIDNT WORK");
                })

            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);

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

            let logetsreq1 = `RECHARGEINITILIZEREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${xml_data}`
            rechargeETSlogger.info(logetsreq1)

            axios(config)
                .then(async function (response) {
                    let output = response.data;
                    var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                    console.log(stringXML);
                    console.log(response.data);
                    let logetsres1 = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(stringXML)}`
                    rechargeETSlogger.info(logetsres1)
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

                        let logetsreq2 = `RECHARGECONFIRMREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${config.url}}`
                        rechargeETSlogger.info(logetsreq2)

                        await axios(config)
                            .then(async function (response) {
                                let output = response.data;
                                var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                                console.log(stringXML);
                                console.log(response.data);

                                let logetsres2 = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${stringXML}}`
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
                                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                    res.json(apiResp)

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

                                    if (purchase) {
                                        let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)

                                        const update_purchase = await db.purchase.update(
                                            {
                                                purchase: upd_bal
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

                                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                                    numberLockLogger.info(lockinfo)
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

            let logdureq = `RECHARGEINITILIZEREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${xml_data}`
            rechargeDulogger.info(logdureq)

            axios(config)
                .then(async function (response) {
                    let output = response.data;
                    var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                    console.log(stringXML);
                    console.log(response.data);
                    let logdures = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${stringXML}`
                    rechargeDulogger.info(logdures)
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

                        let logdureq2 = `RECHARGECONFIRMREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${config.url}}`
                        rechargeDulogger.info(logdureq2)

                        await axios(config)
                            .then(async function (response) {
                                let output = response.data;
                                var stringXML = output.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                                console.log(stringXML);
                                console.log(response.data);

                                let logdures2 = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${stringXML}}`
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
                                    logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)

                                    res.json(apiResp)

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
                                    console.log(logmsg)

                                    if (purchase) {
                                        let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)

                                        const update_purchase = await db.purchase.update(
                                            {
                                                purchase: upd_bal
                                            },
                                            {
                                                where: {
                                                    dist: api.name
                                                }
                                            }
                                        )
                                    }
                                    const apitrx = await db.apitransaction.create(trx_data)
                                    console.log("API TRANSACTION CREATING")
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
                                    console.log("NUMBER UNLOCKED")
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
                                    console.log("BALANCE UNLOCKED")
                                    console.log("CREATING TRANSACTION RECORD API")
                                    const record = await db.transactionrecordapi.create({
                                        apiTransactionId: apitrx.uuid,
                                        status: true,
                                        statement: "Successfully recharged"
                                    })

                                    console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
                                    console.log("Add a entry of success recharge balance and adjust the agents real balance");
                                    let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                                    numberLockLogger.info(lockinfo)
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

            let logrdreq = `RECHARGEREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(resData)}`
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

                let logrdres = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(rdyapi.data)}`
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

                let logrdreq2 = `TRXCHECKREQUEST|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(checkData)}`
                rechargeRDYlogger.info(logrdreq2)

                const rdyapi2 = await axios.request(config2)
                if (rdyapi2) {
                    console.log("2nd API HIT RDY : ", rdyapi2);
                    // {"STATUSCODE":"0","STATUSMSG":"Success","REFNO":"02RDYU2906","TRNID":28099563,"TRNSTATUS":1,"TRNSTATUSDESC":"Success","OPRID":"MHR2305291527260020"}
                    const respMsg = `StatusCode: ${rdyapi2.data.STATUSCODE}, StatusMSG: ${rdyapi2.data.STATUSMSG} , REFNO: ${rdyapi2.data.REFNO} , TRNID: ${rdyapi2.data.TRNID} , TRNSTATUS : ${rdyapi2.data.TRNSTATUS} , OPRID : ${rdyapi2.data.OPRID}`
                    // const resp = await saveResponse(respMsg, data.TRNID)
                    let logrdres2 = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(rdyapi2.data)}`
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

                        if (purchase) {
                            let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)

                            const update_purchase = await db.purchase.update(
                                {
                                    purchase: upd_bal
                                },
                                {
                                    where: {
                                        dist: api.name
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
                                    id: lockedNumber.id
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
                                    id: lockedBalance.id
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

                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                        numberLockLogger.info(lockinfo)
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
                    } else {
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
                        logger.info(`${data.username} has attempted unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                        res.json(apiResp)
                    }
                } else {
                    res.json({
                        msg: "RECHARGE DADDY 2nd API HIT FAILED"
                    })
                }
            } else {
                res.json({
                    msg: "RECHARGE DADDY API HIT FAILED"
                })
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


            let logezlreq = `RECHARGEREQUEST|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${querydata}`
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

                let logezlres = `RESPONSE|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${JSON.stringify(apicall.data)}`
                rechargeEZLlogger.info(logezlres)

                console.log(logezlres)

                let logezlreq2 = `TRXCHECKREQUEST|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${trxcheck}`
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
                    let logezlres2 = `RESPONSE|${phonenumber}|${data.plan_amount}|${transaction.uuid}|${api.code}|${network.name}|${JSON.stringify(ezlCheck.data)}`
                    rechargeEZLlogger.info(logezlres2)

                    if (trx_status) {
                        const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                        const syslog = await db.systemlog.create({
                            type: "Recharge",
                            detail: logmsg
                        })

                        if (purchase) {
                            let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)

                            const update_purchase = await db.purchase.update(
                                {
                                    purchase: upd_bal
                                },
                                {
                                    where: {
                                        dist: api.name
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
                                    id: lockedNumber.id
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
                                    id: lockedBalance.id
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
                        let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                        numberLockLogger.info(lockinfo)
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
                        res.json(apiResp)
                    } else {
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
                } else {
                    res.json({
                        msg: "EZLOADAPI CHECK NOT WORKING"
                    })
                }
            } else {
                res.json({
                    msg: "EZLOADAPI DIDNt work"
                })
            }

            // const apiCall = await fetch(apiUrl, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(send_data)
            // })
            //     .then(response => response.json())
            //     .then(async apidata => {
            //         let trxId = apidata.TransactionId
            //         let trxcheck = {
            //             SessionId: "aaead679d0aa42acbc43a62a154279a2",
            //             TransactionId: trxId
            //         }
            //         const checkTrx = await fetch(checkUrl, {
            //             method: 'POST',
            //             headers: {
            //                 'Content-Type': 'application/json'
            //             },
            //             body: JSON.stringify(trxcheck)
            //         })
            //             .then(response => response.json())
            //             .then(async checkdata => {
            //                 console.log(checkdata)
            //                 let trxMsg = `TransactionStatusCode : ${checkdata.TransactionStatusCode} , TransactionStatusName : ${checkdata.TransactionStatusName} , Message: ${checkdata.Message}`
            //                 // const resp = await saveResponse(trxMsg, trxId);
            //                 if (checkdata.TransactionStatusName == "Successful") {
            //                     trx_data = {
            //                         transactionId: transaction.uuid,
            //                         apiId: api.uuid
            //                     }
            //                     trx_api_id = api.uuid
            //                     trx_status = true
            //                 }

            //                 if (trx_status) {
            //                     const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
            //                     const syslog = await db.systemlog.create({
            //                         type: "Recharge",
            //                         detail: logmsg
            //                     })

            //                     if (purchase) {
            //                         let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)

            //                         const update_purchase = await db.purchase.update(
            //                             {
            //                                 purchase: upd_bal
            //                             },
            //                             {
            //                                 where: {
            //                                     dist: api.name
            //                                 }
            //                             }
            //                         )
            //                     }

            //                     const apitrx = await db.apitransaction.create(trx_data)

            //                     const updateNumber = await db.lockednumber.update(
            //                         {
            //                             status: false,
            //                         },
            //                         {
            //                             where: {
            //                                 id: lockedNumber.id
            //                             }
            //                         }
            //                     )

            //                     const updateBalance = await db.lockedbalance.update(
            //                         {
            //                             lockedStatus: false,
            //                             api_trx_id: apitrx.uuid
            //                         },
            //                         {
            //                             where: {
            //                                 id: lockedBalance.id
            //                             }
            //                         }
            //                     )

            //                     const record = await db.transactionrecordapi.create({
            //                         apiTransactionId: apitrx.uuid,
            //                         status: true,
            //                         statement: "Successfully recharged"
            //                     })
            //                     console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
            //                     console.log("Add a entry of success recharge balance and adjust the agents real balance");

            //                     // TODO
            //                     // GET AGENT CUT FROM AGENTPERCENTAGE TABLE
            //                     const percent = await db.agentpercentage.findOne({
            //                         where: {
            //                             userId: user.uuid,
            //                         }
            //                     })

            //                     console.log("Agent Percentage : ", percent.percentage);

            //                     let earned = debit_amount / 100 * percent.percentage

            //                     const earnedData = {
            //                         userId: user.uuid,
            //                         amount: earned,
            //                         trxId: transaction.uuid
            //                     }

            //                     const agentEarning = await db.agentearning.create(earnedData)

            //                     console.log("Agent Earned : ", agentEarning);

            //                     // CREATE ENTRY ON AGENTEARNING TABLE
            //                     // GET API PERCENTAGE FROM APIPERCENT TABLE
            //                     // const orgPercent = 2.0

            //                     const orgPercent = await db.apipercent.findOne({
            //                         where: {
            //                             apiId: trx_api_id,
            //                             mobileId: network.uuid
            //                         }
            //                     })

            //                     console.log("Organization Percent : ", orgPercent);
            //                     let perc = 0.0
            //                     if (orgPercent == null) {
            //                         perc = 0.1
            //                     } else {
            //                         perc = orgPercent.percent
            //                     }

            //                     let orgCut = debit_amount / 100 * perc
            //                     const orgEarnedData = {
            //                         transactionId: transaction.uuid,
            //                         apiId: trx_api_id,
            //                         cutAmount: orgCut
            //                     }
            //                     const orgEarning = await db.organizationearned.create(orgEarnedData)
            //                     console.log("Organization earning : ", orgEarning);
            //                     apiResp = {
            //                         status: "success",
            //                         balance: (userbalance - debit_amount),
            //                         api_trans_code: api.id,
            //                         message: [{
            //                             "description": "Transaction successfull",
            //                             "code": "200",
            //                         }],
            //                         trans_id: data.sub_operator_code + transaction.id,
            //                         trans_code: `${api.code}-${transaction.uuid}`,
            //                         trans_date: now,
            //                         request_endtime: now
            //                     }
            //                     res.json(apiResp)
            //                 } else {
            //                     const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
            //                     const syslog = await db.systemlog.create({
            //                         type: "Recharge",
            //                         detail: logmsg
            //                     })

            //                     const sale_upd = await db.sales.create({
            //                         balance: failed_bal,
            //                         amount: parseFloat(data.plan_amount),
            //                         agent: data.username,
            //                         number: data.ui_number,
            //                         operator: network.name,
            //                         api: api.name,
            //                         profit: -(api_profit)
            //                     })

            //                     const upd_transaction = await db.transaction.update(
            //                         {
            //                             rechargeStatus: false
            //                         },
            //                         {
            //                             where: {
            //                                 id: transaction.id,
            //                             }
            //                         })

            //                     const transfer = await db.agenttransaction.create({
            //                         userId: user.uuid,
            //                         transferedAmount: debit_amount,
            //                         dedcutedAmount: 0.00,
            //                         transactionId: transaction.uuid
            //                     })

            //                     console.log("transaction returned");

            //                     const updateNumber = await db.lockednumber.update(
            //                         {
            //                             status: false,
            //                             trx_id: transaction.uuid
            //                         },
            //                         {
            //                             where: {
            //                                 id: lockedNumber.id
            //                             }
            //                         }
            //                     )

            //                     const updateBalance = await db.lockedbalance.update(
            //                         {
            //                             lockedStatus: false,
            //                         },
            //                         {
            //                             where: {
            //                                 id: lockedBalance.id
            //                             }
            //                         }
            //                     )
            //                     console.log("RETURN TRASACTION CREATED > NUMBER UNLOCKED > BALANCE RETURNED")
            //                     console.log("Balance Unavailable");

            //                     apiResp = {
            //                         status: "failed",
            //                         balance: userbalance,
            //                         api_trans_code: api.id,
            //                         message: [{
            //                             "description": "Transaction was unsuccessfull",
            //                             "code": "200",
            //                         }],
            //                         trans_id: data.sub_operator_code + transaction.id,
            //                         trans_code: `${api.code}-${transaction.uuid}`,
            //                         trans_date: now,
            //                         request_endtime: now
            //                     }
            //                     res.json(apiResp)
            //                 }
            //             })
            //             .catch(e => {
            //                 console.log(e);
            //                 console.log("EZL didn't work")
            //             })
            //     })

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

                                if (purchase) {
                                    let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)

                                    const update_purchase = await db.purchase.update(
                                        {
                                            purchase: upd_bal
                                        },
                                        {
                                            where: {
                                                dist: api.name
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
                                            id: lockedNumber.id
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
                                            id: lockedBalance.id
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

                                let orgCut = debit_amount / 100 * perc
                                const orgEarnedData = {
                                    transactionId: transaction.uuid,
                                    apiId: trx_api_id,
                                    cutAmount: orgCut
                                }
                                const orgEarning = await db.organizationearned.create(orgEarnedData)
                                console.log("Organization earning : ", orgEarning);
                                console.log("********SUCCESS API RESPONSE************")
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
                                logger.info(`${data.username} has attempted an unsuccessfull recharge in ${data.ui_number} for amount of ${data.plan_amount} with the api of ${api.code}. Attempted Device: ${req.get('device')}`)
                                res.json(apiResp)
                            }

                        })
                        .catch(e => {
                            console.log(e);
                            console.log("DNG api url not working")
                        })
                })
                .catch(e => {
                    console.log(e);
                    console.log("DNG Price check url didn't work")
                })

            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);

        } else if (api.code == "DTS") {

            
                   // const apiResp = await rechargeModule.rechargeLive({plan, data, plan_type, network, api, transaction});
           
           
            console.log("inside DTS API")
            const apiurl = "https://preprod-dvs-api.dtone.com";
            const apikey = "Basic ZjdiMmIyMzItYTk4ZC00NzU0LWFhOGEtODY5NGQ1ZmQyZDc0OjFjNDRiNWE5LWQ5YTctNDU1MC05YmQzLTAzNDVkMDQ1MzJkNA==";
            
            const client_id = process.env.LIV_CLIENT_ID
            const transaction_id = '00' + transaction.id
            const msisdn = mobile
            const sendAmount = plan.credit_amount;
            const product_id = plan.productcode;
            let operator = "";
        

            if (network.name == "Jazz") {
                operator = "Jazz Pakistan"
            } 

            let data = JSON.stringify({
                "external_id": transaction_id,
                "product_id": product_id,
                "credit_party_identifier": {
                  "mobile_number": `+${msisdn}`
                }
              });

     
            let loglivereq = `REQUEST|${product_id}|${msisdn}|${transaction.uuid}|${api.code}|${JSON.stringify(data)}`
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
                data : data
              };
              
             axios.request(config)
              .then(async (response) => {
                if(response.data.status.class.message=="CREATED"){
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
                          //console.log(JSON.stringify(response.data));
                          //res.json({message : response.data.status.class.message})

                        
                            let logliveres = `RESPONSE|${data.ui_number}|${data.plan_amount}|${transaction.uuid}|${api.code}|${JSON.stringify(response.data)}`
                            rechargeLivelogger.info(logliveres)
                            console.log("data from live : ", response.data)
                           
                            if(response.data.status.class.message == "CONFIRMED"){
                                trx_data = {
                                    transactionId: transaction.uuid,
                                    apiId: api.uuid
                                }
                                trx_api_id = api.uuid
                                trx_status = true
                            }
        
                            if (trx_status) {
                                const logmsg = `Successful Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                                db.systemlog.create({
                                    type: "Recharge",
                                    detail: logmsg
                                })
        
                                if (purchase) {
                                    let upd_bal = purchase.purchase - parseFloat(req.body.plan_amount)
        
                                     db.purchase.update(
                                        {
                                            purchase: upd_bal
                                        },
                                        {
                                            where: {
                                                dist: api.name
                                            }
                                        }
                                    )
                                }
        
                                const apitrx = await db.apitransaction.create(trx_data)
        
                                 db.lockednumber.update(
                                    {
                                        status: false,
                                    },
                                    {
                                        where: {
                                            id: lockedNumber.id
                                        }
                                    }
                                )
        
                                   db.lockedbalance.update(
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
        
                                db.transactionrecordapi.create({
                                    apiTransactionId: apitrx.uuid,
                                    status: true,
                                    statement: "Successfully recharged"
                                })
                                console.log("API TRX CREATED > NUMBER UNLOCKED > BALANCE UNLOCKED > RECORD CREATED");
                                console.log("Add a entry of success recharge balance and adjust the agents real balance");
                                let lockinfo = `LOCKEDSTATUS: ${mobile}|GOT UNLOCKED|${api.code}|RECHARGE DONE`
                                numberLockLogger.info(lockinfo)
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
                            } else {
                                const logmsg = `Failed Recharge Has been made to ${mobile} by agent ${data.username} for the amount ${plan.credit_amount}`
                              
                                db.systemlog.create({
                                    type: "Recharge",
                                    detail: logmsg
                                })
        
                            db.sales.create({
                                    balance: failed_bal,
                                    amount: parseFloat(data.plan_amount),
                                    agent: data.username,
                                    number: data.ui_number,
                                    operator: network.name,
                                    api: api.name,
                                    profit: -(api_profit)
                                })
                               
                                db.transaction.update(
                                    {
                                        rechargeStatus: false
                                    },
                                    {
                                        where: {
                                            id: transaction.id,
                                        }
                                    })
        
                               db.agenttransaction.create({
                                    userId: user.uuid,
                                    transferedAmount: debit_amount,
                                    dedcutedAmount: 0.00,
                                    transactionId: transaction.uuid
                                })
        
                                console.log("transaction returned");
        
                               db.lockednumber.update(
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
        
                               db.lockedbalance.update(
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
                       
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                }else{
                    res.json({message : response.data.status.class.message})
                }
              })
              .catch((error) => {
                    console.log(error);
              });
           
           
     
            // TRANSACTION RECORDS
            console.log("Transaction Data : ", trx_data);
            console.log("Api ID: ", trx_api_id);
            console.log("Transaction Status : ", trx_status);
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
}