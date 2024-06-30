const db = require("../models");
const { accessLog } = require("../authsrc/middlewares")
const { Op } = require('sequelize');

exports.summary = async(req, res, next) => {
    accessLog.info(`ACCESS MAIN REPORT SUMMARY`)
    let total_purchase = 0.0000
    let total_sales = 0.0000
    let total_revenue = 0.0000

    const purchases = await db.purchase.findAll()
    const sales = await db.sales.findAll()

    for (let i = 0; i<purchases.length; i++) {
        total_purchase += purchases[i].purchase
    }

    for (let i = 0; i<sales.length; i++) {
        total_sales += sales[i].amount
        total_revenue += sales[i].profit
    }

    console.log(total_sales, total_purchase, total_revenue)

    let data = {
        total_purchase: total_purchase,
        total_sales: total_sales,
        total_revenue: total_revenue
    }

    res.json({
        data: data
    })
}

exports.filterSummaryReport = async(req, res, next) => {
    accessLog.info(`ACCESS MAIN REPORT SUMMARY FILTER | ${JSON.stringify(req.body)}`)
    const datedata = req.body
    let total_purchase = 0.0000
    let total_sales = 0.0000
    let total_revenue = 0.0000

    const purchases = await db.purchase.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(datedata.end_date),
                [Op.gte]: new Date(datedata.start_date)
            }
        }
    })  
    const sales = await db.sales.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(datedata.end_date),
                [Op.gte]: new Date(datedata.start_date)
            }
        }
    })  

    for (let i = 0; i<purchases.length; i++) {
        total_purchase += purchases[i].purchase
    }

    for (let i = 0; i<sales.length; i++) {
        total_sales += sales[i].amount
        total_revenue += sales[i].profit
    }

    console.log(total_sales, total_purchase, total_revenue)

    let data = {
        total_purchase: total_purchase,
        total_sales: total_sales,
        total_revenue: total_revenue
    }
    console.log(`FILTERED SUMMARY , ${data}`)
    res.json({
        data: data
    })
}

exports.filterPurchaseReport = async(req, res, next) => {
    accessLog.info(`ACCESS PURCHASE REPORT WITH FILTER | ${JSON.stringify(req.body)}`)
    const data = req.body

    const purchaseList = await db.purchase.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(data.end_date),
                [Op.gte]: new Date(data.start_date)
            }
        }
    })  

    console.log("PURCHASE FILTER")

    res.json({
        data: purchaseList
    })
}

exports.filterSalesReport = async(req, res, next) => {
    accessLog.info(`ACCESS SALES REPORT WITH FILTER | ${JSON.stringify(req.body)}`)
    const data = req.body

    const saleList = await db.sales.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(data.end_date),
                [Op.gte]: new Date(data.start_date)
            }
        }
    })

    console.log("PURCHASE SALES")
    res.json({
        data: saleList
    })
}

exports.filterRevenueReport = async(req, res, next) => {
    accessLog.info(`ACCESS REVENUE REPORT WITH FILTER | ${JSON.stringify(req.body)}`)
    const data = req.body

    const revenueList = await db.sales.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(data.end_date),
                [Op.gte]: new Date(data.start_date)
            }
        }
    })

    console.log("FILTER REVENUE")
    res.json({
        data: revenueList
    })
}

exports.filterCollection = async(req, res, next) => {
    accessLog.info(`ACCESS COLLECTION REPORT WITH FILTER | ${JSON.stringify(req.body)}`)
    console.log("COLLECTION CHECK")
    const datedata = req.body
    let result = []
    let total_debit = 0
    let total_credit = 0
    const data = await db.useramountsettlement.findAll({
        where: {
            createdAt: {
                [Op.lte]: new Date(datedata.end_date),
                [Op.gte]: new Date(datedata.start_date)
            }
        }
    })

    for (let i = 0; i<data.length; i++){
        let user = ''
        const profile = await db.userprofile.findOne({
            where: {
                userId: data[i].userId
            }
        })
        if (profile) {
            user = `${profile.f_name} ${profile.l_name}`
        }else {
            user = null
        }
        let collection = {
            uuid: data[i].uuid,
            user: user,
            userId: data[i].userId,
            debit: data[i].debit,
            credit: data[i].credit,
            note: data[i].note,
            createdAt: data[i].createdAt
        }

        result.push(collection)
        total_debit += data[i].debit
        total_credit += data[i].credit
    }

    console.log("outside block : ", result)
    res.json({
        data: result,
        total_debit: total_debit,
        total_credit: total_credit
    })
}

exports.purchaseReport = async(req, res, next) => {
    accessLog.info(`ACCESS PURCHASE REPORT`)
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
    accessLog.info(`ACCESS SALES REPORT`)
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

    const sales = await db.sales.findAll()

    res.json({
        data: sales
    })
}



exports.revenueReport = async(req, res, next) => {
    accessLog.info(`ACCESS REVENUE REPORT`)
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


    const sales = await db.sales.findAll()

    res.json({
        data: sales
    })
}

exports.addPurchase = async(req, res, next) => {
    accessLog.info(`ADD PURCHASE ENTRY|${JSON.stringify(req.body)}`)
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

exports.collection = async(req, res, next) => {
    accessLog.info(`ACCESS COLLECTION REPORT`)
    console.log("COLLECTION CHECK")
    let result = []
    let total_debit = 0
    let total_credit = 0
    const data = await db.useramountsettlement.findAll()

    for (let i = 0; i<data.length; i++){
        let user = ''
        const profile = await db.userprofile.findOne({
            where: {
                userId: data[i].userId
            }
        })
        if (profile) {
            user = `${profile.f_name} ${profile.l_name}`
        }else {
            user = null
        }
        let collection = {
            uuid: data[i].uuid,
            user: user,
            userId: data[i].userId,
            debit: data[i].debit,
            credit: data[i].credit,
            note: data[i].note,
            createdAt: data[i].createdAt
        }

        result.push(collection)
        total_debit += data[i].debit
        total_credit += data[i].credit
    }

    console.log("outside block : ", result)
    res.json({
        data: result,
        total_debit: total_debit,
        total_credit: total_credit
    })
}