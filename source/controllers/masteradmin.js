const fetch = require("node-fetch-commonjs");
const db = require("../models");

const rechargeModule = require("./recharge");
const calculator = require("./userprofilecalculator");

const { accessLog } = require("../authsrc/middlewares");
const { Op } = require('sequelize');
const moment = require("moment");

const TODAY_START = moment().format('YYYY-MM-DD 00:00');
const NOW = moment().format('YYYY-MM-DD 23:59');

// SUMMARIZED TILE DATA CALCULATED FUNCTIONS
exports.sales = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.transaction
    // db.sales
    const TODAY_START = moment().format('YYYY-MM-DD 00:00');
    const NOW = moment().format('YYYY-MM-DD 23:59');
    console.log("LOGGIN SALES")
    let total_sales = 0.000

    const sales = await db.sales.findAll({
        where: {
            createdAt: { 
              [Op.gte]: TODAY_START,
              [Op.lte]: NOW
           }   
        }
    })
    for (let i = 0; i<sales.length; i++) {
        total_sales += sales[i].amount
        console.log(sales[i].amount)
    }

    res.json({
        total_sales: total_sales
    })
}

exports.collection = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.collection
    const TODAY_START = moment().format('YYYY-MM-DD 00:00');
    const NOW = moment().format('YYYY-MM-DD 23:59');
    let total_collection = 0.00
    const data = await db.useramountsettlement.findAll({
        where: {
            createdAt: { 
              [Op.gte]: TODAY_START,
              [Op.lte]: NOW
           }   
        }
    })
    let total_debit = 0
    for (let i=0; i<data.length; i++){
        if(data[i].note == "User Credit withdrawn"){
            total_debit += data[i].debit
        }
    }
    res.json({
        total_collection: total_debit
    })
}

exports.earning = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.organizationearned
    // db.sales
    let earning_summary = 0.00

    const sales = await db.sales.findAll({
        where: {
            createdAt: { 
              [Op.gte]: TODAY_START,
              [Op.lte]: NOW
           }   
        }
    })
    for (let i = 0; i<sales.length; i++) {
        earning_summary += sales[i].profit
    }
    res.json({
        earning_summary: earning_summary
    })
}

exports.apiBalance = async(req, res, next) => {
    // SEE TABLES BELOW
    // db.api
    // db.purchase

    let total_api_balance = 0.00
    const purchases = await db.purchase.findAll()
    for (let i = 0; i<purchases.length; i++) {
        total_api_balance += purchases[i].purchase
    }
    res.json({
        total_api_balance: total_api_balance
    })
}

exports.marketDue = async(req, res, next) => {
    const TODAY_START = moment().format('YYYY-MM-DD 00:00');
    const NOW = moment().format('YYYY-MM-DD 23:59');
    let total_market_due = 0.00
    // const data = await db.useramountsettlement.findAll({
    //     where: {
    //         createdAt: { 
    //           [Op.gte]: TODAY_START,
    //           [Op.lte]: NOW
    //        }   
    //     }
    // })

    const users = await db.user.findAll({
        where: {
            usertype: "subdealer"
        }
    })
    let total_debit = 0
    let total_credit = 0

    for(let user of users){
        const data = await db.useramountsettlement.findAll({
            where: {
                userId: user.uuid,
                createdAt: { 
                    [Op.gte]: TODAY_START,
                    [Op.lte]: NOW
                } 
            }
        })

        for(let i=0; i<data.length; i++){
            total_credit += data[i].credit
            if(data[i].note == "User Credit withdrawn"){
                total_debit += data[i].debit
            }
        }
    }

    // let total_debit = 0
    // let total_credit = 0
    // for (let i=0; i<data.length; i++){
    //     total_credit += data[i].credit
    //     if(data[i].note == "User Credit withdrawn"){
    //         total_debit += data[i].debit
    //     }
    // }

    let due = total_credit - total_debit
    res.json({
        total_market_due: due
    })
}

exports.remainingCredit = async(req, res, next) => {
    let remaining_credit_limit = 0.00
    // GET TOTAL API BALANCE THEN GET TOTAL MARKET 
    // REMANING CREDIT = API BALANCE - TOTAL MARKET DUE

    // let total_api_balance = 0.00
    // const purchases = await db.purchase.findAll()
    // for (let i = 0; i<purchases.length; i++) {
    //     total_api_balance += purchases[i].purchase
    // }

    // const data = await db.useramountsettlement.findAll()
    // let total_debit = 0
    // let total_credit = 0
    // for (let i=0; i<data.length; i++){
    //     total_credit += data[i].credit
    //     if(data[i].note == "User Credit withdrawn"){
    //         total_debit += data[i].debit
    //     }
    // }

    // let total_market_due = total_credit - total_debit

    // remaining_credit_limit = total_api_balance - total_market_due

    // NEW CALCULATION
    let total_customer_balance = 0.00
    const users = await db.user.findAll({
        where: {
            usertype: "agent"
        }
    })

    for (let user of users){
        let balance = await rechargeModule.userPortalBalance(user.phone)
        total_customer_balance += balance
    }
    // console.log("REMAINING : ", remaining_credit_limit)
    console.log("CUSTOMER : ", total_customer_balance)

    res.json({
        remaining_credit_limit: total_customer_balance
    })
}

// SUMMARIZED FUNCTION ENDS

// LISTING FUNCTION
exports.salesList = async(req, res, next) => {
    let sales_list = []
    const sales = await db.sales.findAll()

    let total_sales = 0.00
    for (let sale of sales){
        total_sales += sale.amount
    }

    res.json({
        total_sales,
        sales_list : sales.reverse()
    })
}

exports.collectionList = async(req, res, next) => {
    let collection_list = []
    const stl = await db.useramountsettlement.findAll()
    const users = await db.user.findAll()
    for (let user of users){
        let total = 0.00

        const data = await db.useramountsettlement.findAll({
            where: {
                userId: user.uuid,
                note: "User Credit withdrawn"
            }
        })

        if(data.length > 0) {
            for (let settle of data){
                total += settle.debit
            }
            let object = {
                store: user.store,
                username: user.phone,
                total: total,
                data: data.reverse()
            }

            collection_list.push(object)
        }        
    }
    res.json({
        collection_list: collection_list.reverse()
    })
}

exports.earningList = async(req, res, next) => {
    let earning_list = []
    const sales = await db.sales.findAll()
    let total_earning = 0.00
    for (let sale of sales){
        total_earning += sale.profit
    }
    res.json({
        total_earning,
        earning_list: sales.reverse()
    })
}

exports.apiList = async(req, res, next) => {
    let api_list = []
    const apis = await db.api.findAll()

    const apipurchase = await db.purchase.findAll()
    res.json({
        api_list: apipurchase
    })
}

// FUNCTION: ONLY RESELLER TRANSFER LIST
exports.resellerBalanceTransferHistory = async(req, res, next) => {
    let balance_transfer_history = []
    const trf_data = await db.useramountsettlement.findAll({
        where: {
            note: "User Credit Data"
        }
    })

    const users = await db.user.findAll({
        where: {
            usertype: "subdealer"
        }
    })
    for (let user of users){
        let total = 0.00

        const data = await db.useramountsettlement.findAll({
            where: {
                userId: user.uuid,
                note: "User Credit Data"
            }
        })

        if(data.length > 0) {
            for (let settle of data){
                total += settle.credit
            }

            let object = {
                user_id: user.uuid,
                store: user.store,
                username: user.phone,
                total: total,
                data: data.reverse()
            }

            balance_transfer_history.push(object)
        }        
    }
    res.json({
        balance_transfer_history: balance_transfer_history.reverse()
    })
}


// FUNCTION: CUSTOMER OF CORRESPONDING RESELLER TRANSFER REQUEST
exports.resellerCustomerBalanceTransferHistory = async(req, res, next) => {
    let user_id = req.body.user_id
    

    const userprofiles = await db.userprofile.findAll({
        where: {
            connectedUser: user_id
        }
    })

    let customers = []
    for(let profile of userprofiles){
        let customer_total = 0.0
        const customer_data = await db.useramountsettlement.findAll({
            where: {
                userId: profile.userId,
                note: "User Credit Data"
            }
        })

        for (let credit of customer_data){
            customer_total += credit.credit
        }
        
        let customer_obj = {
            store: "",
            username: profile.phone,
            total: customer_total,
            data: customer_data.reverse()
        }

        customers.push(customer_obj)
    }

    res.json({
        customer_balance_transfer_history: customers
    })

}



// LISTING FUNCTION ENDS

// RESELLER LIST
exports.resellerList = async(req, res ,next) => {
    const resellers = await db.user.findAll({
        where: {
            usertype: "subdealer"
        }
    })

    res.json({
        reseller_list: resellers
    })
}