const fetch = require("node-fetch-commonjs");
const db = require("../models");
const { stringify } = require("qs");

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

        if(user.userType == "agent"){
            usertype = "Customer"
        }else if(user.userType == "subdealer"){
            usertype = "Sub Reseller"
        }else if(user.userType == "agent"){
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
                userId: user.uuid,
                debit: parseInt(data.amount),
                credit: 0.00,
                note: "User Credit Amount Sent"
            })
        }
    }

    const logmsg = `${req.body.request_voucher_no} got ${req.body.status}`
    const syslog = await db.systemlog.create({
        type: "Credit Transfer",
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