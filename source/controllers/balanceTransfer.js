const fetch = require("node-fetch-commonjs");
const db = require("../models");
const { stringify, parse } = require("qs");

const rechargeModule = require('./recharge');
const { prototype } = require("node-rsa");
const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")

exports.customerBalanceTransferRequestList = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`ACCESS BALANCE TRANSFER REQUEST LIST | ${req.body.username_reseller}`)
    let data = {"voucher_no":"N/A","username_customer":"N/A","username_reseller":"iftaykher","request_status":"All"}

    const list = await db.agenttransferrequest.findAll({
        where: {
            provider_name: req.body.username_reseller
        }
    })

    let respData = {
        invoices: [
            {
                "customer_name": "mini5005",
                "prefix": "BTR",
                "voucher_no": "6105",
                "voucher_date": "2023-08-18 09:06:44",
                "status": "Pending",
                "requested_amount": "500.00000",
                "narration": "Befreshminmart "
            },
            {
                "customer_name": "mini5005",
                "prefix": "BTR",
                "voucher_no": "6105",
                "voucher_date": "2023-08-18 09:06:44",
                "status": "Rejected",
                "requested_amount": "500.00000",
                "narration": "Befreshminmart "
            },
            {
                "customer_name": "mini5005",
                "prefix": "BTR",
                "voucher_no": "6105",
                "voucher_date": "2023-08-18 09:06:44",
                "status": "Approved",
                "requested_amount": "500.00000",
                "narration": "Befreshminmart "
            }
        ]
    }

    res.json({
        invoices: list
    })
}

exports.agentTransferHistory = async(req, res, next) => {
    // let testdata = {
    //     voucher_no: `BTC 00 ${trx[i].id}`,
    //     voucher_date: trx[i].createdAt,
    //     paid_amount: trx[i].transferedAmount.toString()
    // }

    let data = {"username": "01925995658"}
    let respData = []

    const list = await db.agenttransferrequest.findAll({
        where: {
            customer_name: req.body.username,
            status: req.body.status
        }
    })

    for (let i =0; i<list.length; i++){
        let listData = {
            voucher_no: `BTR 00 ${list[i].id}`,
            voucher_date: list[i].createdAt,
            paid_amount: list[i].requested_amount.toString(),
            status: list[i].status
        }
        respData.push(listData)
    }

    res.json({
        status: "success",
        invoices: respData
    })
}

exports.createBalanceTransfer = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`CREATE BALANCE TRANSFER|${JSON.stringify(req.body)}`)
    let d = {
        "username_customer": "01646442323",
        "voucher_date": "2023-8-22",
        "amount": "100",
        "narration": "bfbgbtvtv"
    }

    let data = req.body

    const user = await db.user.findOne({
        where: {
            phone: data.username_customer
        }
    })
    console.log("USER")
    console.log(user)
    const userprofile = await db.userprofile.findOne({
        where: {
            userId: user.uuid
        }
    })
    console.log("USER PROFILE")
    console.log(userprofile)
    const username_provider = await db.user.findOne({
        where: {
            uuid: userprofile.connectedUser
        }
    })
    console.log("USER PORVIDER")
    console.log(username_provider)
    const transfer = await db.agenttransferrequest.create({
        customer_name: data.username_customer,
        provider_name: username_provider.phone,
        prefix: "BTR",
        status: "Pending",
        transfer_type: null,
        voucher_no: null,
        requested_amount: data.amount,
        narration: data.narration,
        ui_voucher_date: data.voucher_date
    })
    console.log("TRANSFER DATA")
    console.log(transfer);

    const trfUpdate = await db.agenttransferrequest.update(
        {
            voucher_no: stringify(transfer.id)
        },
        {
            where: {
                id : transfer.id
            }
        }
    )

    console.log("after Update")
    console.log(trfUpdate)

    let logsms = `${data.amount} - ${transfer.uuid} - [agenttransferrequest] - ${data.username_customer} - APP`
    transferlogger.info(logsms)
    res.json({
        status: "success",
        prefix: "BTR",
        voucher_no: transfer.id
    })
}

exports.approveTransfer = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`APPROVE TRANSFER|${JSON.stringify(req.body)}`)
    let data = {
        "username_reseller": "iftaykher",
        "username_customer": "fulkoli038",
        "voucher_date": "2023-8-21",
        "amount": "30.00000",
        "narration": "#APP #N/A",
        "transfer_type": "credit",
        "request_voucher_no": "6077",
        "status": "Approved"
    }
    let usertype = ""
    const trf = await db.agenttransferrequest.update({
        status: "Approved",
        where: {
            uuid: req.body.trfId
        }
    })

    const user = await db.user.findOne({
        where: {
            phone: trf.customer_name
        }
    })

    if(user.userType == "agent"){
        usertype = "Customer"
    }else if(user.userType == "subdealer"){
        usertype = "Sub Reseller"
    }else if(user.userType == "agent"){
        usertype = "Sales"
    }

    const transfer = await db.agenttransaction.create({
        userId: user.uuid,
        transferedAmount: trf.requested_amount,
        dedcutedAmount: 0.00
    })
    
    console.log("transfer data, ", transfer);

    const settlement = await db.useramountsettlement.create({
        userId: user.uuid,
        debit: 0.00,
        credit: requested_amount,
        note: "User Credit Data"
    })

    const history = await db.agenttransferhistory.create({
        transferId: trf.uuid,
        from: trf.provider_name,
        to: trf.custmer_name,
        amount: trf.requested_amount,
        transferredToUserType: usertype
    })

    const logmsg = `Amount ${trf.requested_amount} has been transferred to ${user.phone}'s account`
    let logsms = `${trf.requested_amount} - ${trf.uuid} - [agenttransferrequest] - ${user.phone} - APP`
    transferApprovallogger.info(logsms)
    const syslog = await db.systemlog.create({
        type: "Transfer",
        detail: logmsg
    })

    let resp_Data = {
        status: "success",
        prefix: "BTC",
        voucher_no: "0",
        balance: "0"
    }

    res.json(resp_Data)
}

exports.declineTransfer = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`DECLINE TRANSFER|${JSON.stringify(req.body)}`)
    let data = {
        "username_reseller": "iftaykher",
        "username_customer": "fulkoli038",
        "voucher_date": "2023-07-26",
        "amount": "30.00000",
        "narration": "APPROVED AGAINST #BTR 6077",
        "request_voucher_no": "6077",
        "status": "Rejected"
    }
    const transfer = await db.agenttransferrequest.update({
        status: data.status,
        where: {
            voucher_no: req.body.request_voucher_no
        }
    })

    let resp_Data = {
        status: "success",
        prefix: "BTC",
        voucher_no: "0",
        balance: "0"
    }

    let logsms = `${transfer.requested_amount} - ${transfer.uuid} - [agenttransferrequest] - ${transfer.customer_name} - APP`
    transferDeclinelogger.info(logsms)
    res.json(resp_Data)
}

exports.salesmanBalanceTransfer = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`SALESMAN BALANCE TRANSFER|${JSON.stringify(req.body)}`)
    const portalBalance = await rechargeModule.userPortalBalance(req.body.username_reseller)
    let resp_Data = {}
    let data = req.body
    if(parseInt(data.amount) > portalBalance) {
        console.log("INSIDE FAILED")
        const logmsg = `${req.body.request_voucher_no} got ${req.body.status}`
        const syslog = await db.systemlog.create({
            type: "Credit Transfer",
            detail: logmsg
        })

        let logsms = `${req.body.request_voucher_no} - ${req.body.status}`
        transferlogger.info(logsms)

        resp_Data = {
            status: "failed",
            prefix: "BTC",
            voucher_no: "0",
            portal_balance: portalBalance.toString()
        }
    }else{
        console.log("INSIDE PASS")
        if(data.status == "Rejected"){
            const transfer = await db.agenttransferrequest.update(
                {
                    status: req.body.status,
                    transfer_type: data.transfer_type,
                },{
                    where: {
                        id: parseInt(req.body.request_voucher_no)
                    }
                }
            )
        }else if(data.status == "Approved"){
            let usertype = ""
            console.log("INSIDE NUMBER")
            const trfx = await db.agenttransferrequest.update(
                {
                    status: req.body.status
                },{
                    where: {
                        id: parseInt(req.body.request_voucher_no)
                    }
                }
            )
    
            const trf = await db.agenttransferrequest.findOne({
                where: {
                    id: parseInt(req.body.request_voucher_no)
                }
            })
            voucher_no = parseInt(req.body.request_voucher_no)
        
    
            const user = await db.user.findOne({
                where: {
                    phone: trf.customer_name
                }
            })
    
            const superuser = await db.user.findOne({
                where: {
                    phone: trf.provider_name
                }
            })
    
            console.log(user)
    
            if(user.usertype == "agent"){
                usertype = "Customer"
            }else if(user.usertype == "subdealer"){
                usertype = "Sub Reseller"
            }else if(user.usertype == "agent"){
                usertype = "Sales"
            }
    
            const transfer = await db.agenttransaction.create({
                userId: user.uuid,
                transferedAmount: parseInt(data.amount),
                dedcutedAmount: 0.00
            })
            
            console.log("transfer data, ", transfer);
    
            const settlement = await db.useramountsettlement.create({
                userId: user.uuid,
                debit: 0.00,
                credit: parseInt(data.amount),
                note: "User Credit Data"
            })
    
            const history = await db.agenttransferhistory.create({
                transferId: trf.uuid,
                from: trf.provider_name,
                to: trf.customer_name,
                amount: trf.requested_amount,
                transferredToUserType: usertype
            })
    
            if (superuser.type != "admin"){
                const transfer = await db.agenttransaction.create({
                    userId: superuser.uuid,
                    transferedAmount: 0.00,
                    dedcutedAmount: parseInt(data.amount)
                })
                
                console.log("transfer data, ", transfer);
        
                const settlement = await db.useramountsettlement.create({
                    userId: superuser.uuid,
                    debit: parseInt(data.amount),
                    credit: 0.00,
                    note: "User Credit Amount Sent"
                })
            }
        }else if(data.status == undefined){
            console.log("UNDEFINED AREA")
            let usertype = ""
            const trf = await db.agenttransferrequest.create({
                customer_name: req.body.username_customer,
                provider_name: req.body.username_reseller,
                prefix: "BTR",
                status: "Approved",
                transfer_type: req.body.transfer_type,
                voucher_no: null,
                requested_amount: req.body.amount,
                narration: req.body.narration,
                ui_voucher_date: req.body.voucher_date
            })
    
            console.log(trf)
    
            const trfx = await db.agenttransferrequest.update(
                {
                    voucher_no: trf.id
                },
                {
                    where: {
                        id: trf.id
                    }
                }
            )
    
            console.log(trf.id)
    
            const user = await db.user.findOne({
                where: {
                    phone: trf.customer_name
                }
            })
    
            const superuser = await db.user.findOne({
                where: {
                    phone: trf.provider_name
                }
            })
    
            console.log(user)
    
            if(user.usertype == "agent"){
                usertype = "Customer"
            }else if(user.usertype == "subdealer"){
                usertype = "Sub Reseller"
            }else if(user.usertype == "agent"){
                usertype = "Sales"
            }
    
            const transfer = await db.agenttransaction.create({
                userId: user.uuid,
                transferedAmount: parseInt(data.amount),
                dedcutedAmount: 0.00
            })
            
            console.log("transfer data, ", transfer);
    
            const settlement = await db.useramountsettlement.create({
                userId: user.uuid,
                debit: 0.00,
                credit: parseInt(data.amount),
                note: "User Credit Data"
            })
    
            const history = await db.agenttransferhistory.create({
                transferId: trf.uuid,
                from: trf.provider_name,
                to: trf.customer_name,
                amount: trf.requested_amount,
                transferredToUserType: usertype
            })
            if (superuser.type != "admin"){
                const transfer = await db.agenttransaction.create({
                    userId: superuser.uuid,
                    transferedAmount: 0.00,
                    dedcutedAmount: parseInt(data.amount)
                })
                
                console.log("transfer data, ", transfer);
        
                const settlement = await db.useramountsettlement.create({
                    userId: superuser.uuid,
                    debit: parseInt(data.amount),
                    credit: 0.00,
                    note: "User Credit Amount Sent"
                })
            }
        }

        const logmsg = `${req.body.request_voucher_no} - ${req.body.status} - APP`
        let logsms = `${req.body.username_reseller} - ${req.body.amount} - ${req.body.request_voucher_no}[agenttransferrequest] -> ${req.body.username_customer} - APP`
        transferlogger.info(logmsg)
        const syslog = await db.systemlog.create({
            type: "Credit Transfer",
            detail: logmsg
        })

        resp_Data = {
            status: "success",
            prefix: "BTC",
            voucher_no: "0",
            portal_balance: portalBalance.toString()
        }
    }

    console.log("BEFORE RESPONSE")
    
    res.json(resp_Data)
}

exports.resellerBalanceTransfer = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`RESELLER BALANCE TRANSFER|${JSON.stringify(req.body)}`)
    let body_data = {"username_reseller":"iftaykher","username_sub_reseller":"roy415","voucher_date":"2023-9-12","amount":"5","narration":"#APP #N/A","transfer_type":"credit"}
    let response_data = {"status": "success", "message": "Saved successfully", "prefix": "BTSR", "voucher_no": 12195, "portal_balance": "1557.06000"}
    // TODO
    // DO A PORTAL BALANCE CHECK HERE
    const reseller = await db.user.findOne({
        where: {
            phone: req.body.username_reseller
        }
    })

    const sub_reseller = await db.user.findOne({
        where: {
            phone: req.body.username_sub_reseller
        }
    })

    const transfer = await db.agenttransferrequest.create({
        customer_name: sub_reseller.phone,
        provider_name: reseller.phone,
        prefix: "BTSR",
        status: "Approved",
        transfer_type: req.body.transfer_type,
        voucher_no: null,
        requested_amount: req.body.amount,
        narration: req.body.narration,
        ui_voucher_date: req.body.voucher_date
    })

    const history = await db.agenttransferhistory.create({
        transferId: transfer.uuid,
        from: transfer.provider_name,
        to: transfer.customer_name,
        amount: transfer.requested_amount,
        transferredToUserType: "Sub Reseller"
    })

    const trx = await db.agenttransaction.create({
        userId: sub_reseller.uuid,
        transferedAmount: parseInt(req.body.amount),
        dedcutedAmount: 0.00,
    })

    const settlement = await db.useramountsettlement.create({
        userId: sub_reseller.uuid,
        debit: 0.00,
        credit: parseInt(req.body.amount),
        note: "User Credit Data"
    })


    if (reseller.type != "admin"){
        const transfer = await db.agenttransaction.create({
            userId: reseller.uuid,
            transferedAmount: 0.00,
            dedcutedAmount: parseInt(req.body.amount)
        })
        
        console.log("transfer data, ", transfer);

        const settlement = await db.useramountsettlement.create({
            userId: reseller.uuid,
            debit: parseInt(req.body.amount),
            credit: 0.00,
            note: "User Credit Amount Sent"
        })
    }

    const portalBalance = await rechargeModule.userPortalBalance(req.body.username_reseller)

    let logsms = `${reseller.phone} - ${req.body.amount} - ${transfer.uuid} -> ${sub_reseller.phone} - APP`
    transferlogger.info(logsms)
    res.json({
        status: "success",
        message: "Transferred Successfully",
        prefix: "BTSR",
        voucher_no: transfer.id,
        portal_balance: portalBalance.toString()
    })
}

exports.balanceTransferSubReseller = async(req, res, next) =>{
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`SUB RESELLER BALANCE TRANSFER|${JSON.stringify(req.body)}`)
    let dt = {"username_reseller":"01646442322","username_sub_customer":"01646442323","voucher_date":"2023-9-14","amount":"100","narration":"","transfer_type":"credit"}
    // TODO
    // DO A PORTAL BALANCE CHECK HERE
    
    const reseller = await db.user.findOne({
        where: {
            phone: req.body.username_reseller
        }
    })

    console.log("RESELLER")
    console.log(reseller)

    const sub_customer = await db.user.findOne({
        where: {
            phone: req.body.username_sub_customer
        }
    })

    console.log("SUB CUSTOMER")
    console.log(sub_customer)

    const transfer = await db.agenttransferrequest.create({
        customer_name: sub_customer.phone,
        provider_name: reseller.phone,
        prefix: "BTSRC",
        status: "Approved",
        transfer_type: req.body.transfer_type,
        voucher_no: null,
        requested_amount: req.body.amount,
        narration: req.body.narration,
        ui_voucher_date: req.body.voucher_date
    })

    const history = await db.agenttransferhistory.create({
        transferId: transfer.uuid,
        from: transfer.provider_name,
        to: transfer.customer_name,
        amount: transfer.requested_amount,
        transferredToUserType: "Customer"
    })

    const trx = await db.agenttransaction.create({
        userId: sub_customer.uuid,
        transferedAmount: parseInt(req.body.amount),
        dedcutedAmount: 0.00,
    })

    const trfx = await db.agenttransferrequest.update(
        {
            voucher_no: transfer.id
        },
        {
            where: {
                id: transfer.id
            }
        }
    )

    const settlement = await db.useramountsettlement.create({
        userId: sub_customer.uuid,
        debit: 0.00,
        credit: parseInt(req.body.amount),
        note: "User Credit Data"
    })

    if (reseller.type != "admin"){
        const transfer = await db.agenttransaction.create({
            userId: reseller.uuid,
            transferedAmount: 0.00,
            dedcutedAmount: parseInt(req.body.amount)
        })
        
        console.log("transfer data, ", transfer);

        const settlement = await db.useramountsettlement.create({
            userId: reseller.uuid,
            debit: parseInt(req.body.amount),
            credit: 0.00,
            note: "User Credit Amount Sent"
        })
    }

    let logsms = `${reseller.phone} - ${req.body.amount} - ${transfer.uuid} -> ${sub_customer.phone} - APP`
    transferlogger.info(logsms)

    res.json({
        status: "success",
        message: "Transferred Successfully",
        prefix: "BTSRC",
        voucher_no: transfer.id,
        portal_balance: portalBalance.toString()
    })
}

exports.getUserOutstanding = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`GET OUTSTANDING BALANCE|${JSON.stringify(req.body)}`)
    let req_data = {"username_reseller":"iftaykher","username_sub_user":"roy415","user_type":"SUB_RESELLER"}

    let total = 0.00
    let debit = 0.00
    let credit = 0.00

    const dues = await db.useramountsettlement.findAll({
        where: {
            userId: req.body.uuid
        }
    })

    for(let i=0; i<dues.length; i++){
        debit += parseFloat(dues[i].debit)
        credit += parseFloat(dues[i].credit)
    }

    total = debit - credit

    res.json({
        total_transferred: credit.toFixed(2).toString(),
        total_received: debit.toFixed(2).toString(),
        total_outstanding: total.toFixed(2).toString()
    })
}

exports.cashWithdrawal = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    accessLog.info(`CASH WITHDRAWAL|${req.body}`)
    console.log("REQ BODY : ", req.body, req)
    console.log("REQ BODY DATA : ", req.body.data)
    // let parsed_data = JSON.parse(req.body.data)
    let parsed_data = req.body.data
    console.log("PARSED JSON : ", parsed_data)
    let id = parsed_data.uuid

    console.log("UUID FROM REQUEST : ", id)
    console.log("COLLECTION DATA : ", parsed_data.collection_data)
    console.log("COLLECTION DATA RECEIVED AMOUNT VALUE : ", parsed_data.collection_data[0].received_amount)
    console.log("COLLECTION DATA FLOAT CONVERTED VALUE: ", parseFloat(parsed_data.collection_data[0].received_amount))
    let debit = parseFloat(parsed_data.collection_data[0].received_amount)
    console.log(debit)

    const settlement = await db.useramountsettlement.create({
        userId: id,
        debit: debit,
        credit: 0.00,
        note: "User Credit withdrawn"
    })

    console.log("SEttlEMENT COMPLEteD")

    const logmsg = `Withdrawal has been made from the user ${id} for the amount of %${debit}`
    const syslog = await db.systemlog.create({
        type: "Withdrawal",
        detail: logmsg
    })
    var msg = `${parsed_data.username_reseller} - ${parsed_data.collection_data[0].received_amount} - ${parsed_data.collection_data[0].username_sub_customer} - ${settlement.uuid} [useramountsettlement] - APP`
    withdrawlogger.info(msg)

    res.json({
        status: "success"
    })
}

exports.getCustReceiptInfo = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    let body_data = {"username_reseller":"01646442322","voucher_no":"8"}

    // data['voucher_no'] = this.voucherNo;
    // data['voucher_date'] = this.voucherDate;
    // data['total_credit'] = this.totalCredit;
    // data['total_received'] = this.totalReceived;
    // data['current_outstanding'] = this.currentOutstanding;
    // data['wallet_balance'] = this.walletBalance;
    // data['customer_name'] = this.customerName;
    // data['reseller_name'] = this.resellerName;

    res.json({
        status: "success",
        data: {
            voucher_no: "",
            voucher_date: "",
            total_credit: 0.1,
            total_received: 0.1,
            current_outstanding: 0.1,
            wallet_balance: 0.1,
            customer_name: "",
            reseller_name: "",
            transfer_invoices: [
                {
                    voucher_no: "",
                    voucher_date: "",
                    invoice_amount: 0.1,
                    received_amount: 0.1,
                    balance_amount: 0.1
                }
            ]
        },
        voucher_no: "",
        voucher_date: "",
        total_credit: 0.1,
        total_received: 0.1,
        current_outstanding: 0.1,
        wallet_balance: 0.1,
        customer_name: "",
        reseller_name: "",
        transfer_invoices: [
            {
                voucher_no: "",
                voucher_date: "",
                invoice_amount: 0.1,
                received_amount: 0.1,
                balance_amount: 0.1
            }
        ]
    })
}

exports.resellerPaymentCollection = async(req, res, next) => {
    const { transferlogger, transferApprovallogger, transferDeclinelogger, withdrawlogger, accessLog } = require("../authsrc/middlewares")
    let body_data = {"data":"{\"username_reseller\":\"01646442321\",\"voucher_date\":\"2023-9-13\",\"total_received\":\"10\",\"narration\":\"gfgdfft\",\"collection_data\":[{\"username_sub_reseller\":\"01646442322\",\"received_amount\":\"10\"}]}"}
    res.json({
        status: "success"
    })
}