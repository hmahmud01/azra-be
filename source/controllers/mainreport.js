const db = require("../models");

exports.summary = async(req, res, next) => {
    let total_purchase = 0.0000
    let total_sales = 0.0000
    let total_revenue = 0.0000

    let data = {
        total_purchase: total_purchase,
        total_sales: total_sales,
        total_revenue: total_revenue
    }

    res.json({
        data: data
    })
}

exports.purchaseReport = async(req, res, next) => {

    let data = [
        {
            date: "23-09-2023",
            telco: "GP, BL, AIRTEL",
            dist: "LIVE",
            purchase: 15500,
            payable: 15000,
            commission: 3.33,
            entrydate: "25-09-2023",
            locale: "Local",
            conv: 1
        },
        {
            date: "24-09-2023",
            telco: "ETS",
            dist: "ETS",
            purchase: 15500,
            payable: 15000,
            commission: 3.33,
            entrydate: "24-09-2023",
            locale: "International",
            conv: 1.23
        }
    ]

    const purchaseList = await db.purchase.findAll()
    console.log("PURCHASE")
    console.log(purchaseList)

    res.json({
        data: purchaseList
    })
}

exports.salesReport = async(req, res, next) => {
    let data = [
        {  
            balance: 14900,
            amount: 100,
            agent: "Mokhles",
            number: "01797559955",
            operator: "GP",
            api: "LIVE",
            time: "10-10-2023"
        },
        {
            balance: 14800,
            amount: 200,
            agent: "Mokhles",
            number: "01669559955",
            operator: "AIRTEL",
            api: "LIVE",
            time: "10-10-2023"
        }
    ]
    res.json({
        data: data
    })
}

exports.revenueReport = async(req, res, next) => {
    let data = [
        {
            amount: 100,
            agent: "Mokhles",
            number: "01797559955",
            operator: "GP",
            api: "LIVE",
            time: "10-10-2023",
            profit: .5
        },
        {
            amount: 200,
            agent: "Mokhles",
            number: "01669559955",
            operator: "AIRTEL",
            api: "LIVE",
            time: "10-10-2023",
            profit: .5
        }
    ]
    res.json({
        data: data
    })
}

exports.addPurchase = async(req, res, next) => {
    let data = req.body
    console.log(data)
    let dist = data.dist
    let telco = data.telco
    let purchase = data.purchase
    let payable = data.payable
    let commission = data.commission
    let entrydate = data.entryDate
    let locale = data.locale
    let conv = data.conv

    let queryData = `DIST: ${dist}, TELCO: ${telco}, PURCHASE: ${purchase}, PAYABLE: ${payable}`

    const entry = await db.purchase.create({
        telco: telco,
        dist: dist,
        purchase: purchase,
        payable: payable,
        commission: commission,
        entrydate: entrydate,
        locale: locale,
        conv: conv
    })
    
    res.json({
        data: queryData
    })
}