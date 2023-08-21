const fetch = require("node-fetch-commonjs");
const db = require("../models");

exports.customerBalanceTransferRequestList = async(req, res, next) => {
    let data = {"voucher_no":"N/A","username_customer":"N/A","username_reseller":"iftaykher","request_status":"All"}

    const list = await db.agenttransferrequest({
        where: {
            provider_name: req.body.username_customer
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

    res.json(respData)
}

exports.createBalanceTransfer = async(req, res, next) => {
    const transfer = await db.agenttransferrequest.create({
        customer_name: req.body.username,
        provider_name: req.body.username_customer,
        prefis: "BTR",
        status: "Pending",
        request_amount: req.body.amount,
        narration: req.body.narration
    })

    const trfUpdate = await db.agenttransferrequest.update({
        voucher_no: transfer.id,
        where: {
            id : transfer.id
        }
    })

    res.json({
        msg: "Created"
    })
}

exports.approveTransfer = async(req, res, next) => {
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

    res.json({
        msg: "Success"
    })
}

exports.declineTransfer = async(req, res, next) => {
    const transfer = await db.agenttransferrequest.update({
        status: "Rejected",
        where: {
            uuid: req.body.trfId
        }
    })

    res.json({
        msg: "Success"
    })
}