const fetch = require("node-fetch-commonjs");
const db = require("../models");
const { stringify, parse } = require("qs");

const rechargeModule = require('./recharge');

exports.customerBalanceTransferRequestList = async(req, res, next) => {
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

exports.createBalanceTransfer = async(req, res, next) => {
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

    res.json({
        status: "success",
        prefix: "BTR",
        voucher_no: transfer.id
    })
}

exports.approveTransfer = async(req, res, next) => {

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

    res.json(resp_Data)
}

exports.salesmanBalanceTransfer = async(req, res, next) => {
    let data = req.body
    console.log(data.status)
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
            to: trf.custmer_name,
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
            to: trf.custmer_name,
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

    // console.log(voucher_no)
    // if(parseInt(req.body.request_voucher_no) != NaN){
    //     const trx = await db.agenttransferrequest.findOne({
    //         where: {
    //             id: parseInt(req.body.request_voucher_no)
    //         }
    //     })
    // }


    const portalBalance = await rechargeModule.userPortalBalance(req.body.username_reseller)

    const logmsg = `${req.body.request_voucher_no} got ${req.body.status}`
    const syslog = await db.systemlog.create({
        type: "Credit Transfer",
        detail: logmsg
    })

    let resp_Data = {
        status: "success",
        prefix: "BTC",
        voucher_no: "0",
        portal_balance: portalBalance.toString()
    }

    res.json(resp_Data)
}

exports.resellerBalanceTransfer = async(req, res, next) => {
    let body_data = {"username_reseller":"iftaykher","username_sub_reseller":"roy415","voucher_date":"2023-9-12","amount":"5","narration":"#APP #N/A","transfer_type":"credit"}
    let response_data = {"status": "success", "message": "Saved successfully", "prefix": "BTSR", "voucher_no": 12195, "portal_balance": "1557.06000"}

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
        transfer: parseInt(req.body.amount),
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

    res.json({
        status: "success",
        message: "Transferred Successfully",
        prefix: "BTSR",
        voucher_no: transfer.id,
        portal_balance: portalBalance.toString()
    })
}

exports.getUserOutstanding = async(req, res, next) => {
    let req_data = {"username_reseller":"iftaykher","username_sub_user":"roy415","user_type":"SUB_RESELLER"}

    let total_transferred = 0.00
    let total_received = 0.00
    let total_outstanding = 0.00

    const requests = await db.agenttransferrequest.findAll({
        where: {
            customer_name: req.body.username_sub_user
        }
    })

    for (let i = 0; i<requests.length; i++){
        total_transferred += parseFloat(requests[i].requested_amount)
        if(requests[i].status == "Approved"){
            total_received += parseFloat(requests[i].requested_amount)
        }
    }

    total_outstanding = total_transferred - total_received
    // {"total_transferred": "65746.0", "total_received": "64336.0", "total_outstanding": "1410.0"}
    res.json({
        total_transferred: total_transferred,
        total_received: total_received,
        total_outstanding: total_outstanding
    })
}

exports.cashWithdrawal = async(req, res, next) => {
    res.json({
        status: "success"
    })
}

exports.getCustReceiptInfo = async(req, res, next) => {
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
    let body_data = {"data":"{\"username_reseller\":\"01646442321\",\"voucher_date\":\"2023-9-13\",\"total_received\":\"10\",\"narration\":\"gfgdfft\",\"collection_data\":[{\"username_sub_reseller\":\"01646442322\",\"received_amount\":\"10\"}]}"}
    res.json({
        status: "success"
    })
}