const fetch = require("node-fetch-commonjs");
const db = require("../models");

const rechargeModule = require("./recharge");
const calculator = require("./userprofilecalculator");

const { accessLog } = require("../authsrc/middlewares");
// const { Op, col } = require('sequelize');
const { fn, col, Op, literal } = require('sequelize');
const moment = require("moment");

const TODAY_START = moment().format('YYYY-MM-DD 00:00');
const NOW = moment().format('YYYY-MM-DD 23:59');

// SUMMARIZED TILE DATA CALCULATED FUNCTIONS
exports.sales = async (req, res, next) => {
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
    for (let i = 0; i < sales.length; i++) {
        total_sales += sales[i].amount
        console.log(sales[i].amount)
    }

    res.json({
        total_sales: total_sales
    })
}

exports.collection = async (req, res, next) => {
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
    for (let i = 0; i < data.length; i++) {
        if (data[i].note == "User Credit withdrawn") {
            total_debit += data[i].debit
        }
    }
    res.json({
        total_collection: total_debit
    })
}

exports.earning = async (req, res, next) => {
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
    for (let i = 0; i < sales.length; i++) {
        earning_summary += sales[i].profit
    }
    res.json({
        earning_summary: earning_summary
    })
}

exports.apiBalance = async (req, res, next) => {
    // SEE TABLES BELOW
    // db.api
    // db.purchase

    let total_api_balance = 0.00
    const purchases = await db.purchase.findAll()
    for (let i = 0; i < purchases.length; i++) {
        total_api_balance += purchases[i].purchase
    }
    res.json({
        total_api_balance: total_api_balance
    })
}

exports.marketDue = async (req, res, next) => {
    const TODAY_START = moment().format('YYYY-MM-DD 00:00');
    const NOW = moment().format('YYYY-MM-DD 23:59');
    let total_market_due = 0.00


    const users = await db.user.findAll({
        where: {
            usertype: "agent"
        }
    })

    let total_debit = 0
    let total_credit = 0

    for (let user of users) {
        const data = await db.useramountsettlement.findAll({
            where: {
                userId: user.uuid,
            }
        })

        for (let i = 0; i < data.length; i++) {
            total_credit += data[i].credit
            if (data[i].note == "User Credit withdrawn") {
                total_debit += data[i].debit
            }
        }
    }

    let due = total_credit - total_debit
    res.json({
        total_market_due: due
    })
}

exports.remainingCredit = async (req, res, next) => {
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

    for (let user of users) {
        let balance = await rechargeModule.userPortalBalance(user.phone)
        total_customer_balance += balance
    }
    console.log("CUSTOMER : ", total_customer_balance)

    res.json({
        remaining_credit_limit: total_customer_balance
    })
}

// SUMMARIZED FUNCTION ENDS

// LISTING FUNCTION
exports.collectionList = async (req, res, next) => {
    let collection_list = []
    const stl = await db.useramountsettlement.findAll()
    const users = await db.user.findAll()
    for (let user of users) {
        let total = 0.00

        const data = await db.useramountsettlement.findAll({
            where: {
                userId: user.uuid,
                note: "User Credit withdrawn"
            }
        })

        if (data.length > 0) {
            for (let settle of data) {
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

exports.salesList = async (req, res, next) => {
    let limit = req.query.limit
    if (limit) {
        console.log(typeof (limit))
        const sales = await db.sales.findAll({
            order: [['date', 'DESC']],
            limit: parseInt(limit),
        })
        let total_sales = 0.00
        for (let sale of sales) {
            total_sales += sale.amount
        }

        res.json({
            total_sales,
            sales_list: sales.reverse()
        })

    } else {
        const sales = await db.sales.findAll()
        let total_sales = 0.00
        for (let sale of sales) {
            total_sales += sale.amount
        }

        res.json({
            total_sales,
            sales_list: sales.reverse()
        })
    }

    // res.json({
    //     total_sales,
    //     sales_list : sales.reverse()
    // })

}

exports.earningList = async (req, res, next) => {
    let limit = req.query.limit

    console.log(limit)
    if (limit) {
        const sales = await db.sales.findAll({
            order: [['date', 'DESC']],
            limit: parseInt(limit),
        })
        let total_earning = 0.00
        for (let sale of sales) {
            total_earning += sale.profit
        }
        res.json({
            total_earning,
            earning_list: sales.reverse()
        })
    } else {
        const sales = await db.sales.findAll()
        let total_earning = 0.00
        for (let sale of sales) {
            total_earning += sale.profit
        }
        res.json({
            total_earning,
            earning_list: sales.reverse()
        })
    }
}

// function getLast30Days() {
//     const days = [];
//     const today = new Date();

//     for (let i = 29; i >= 0; i--) { // 0 to 29 for the last 30 days
//         const pastDate = new Date();
//         pastDate.setDate(today.getDate() - i);
//         const year = pastDate.getFullYear();
//         const month = String(pastDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
//         const day = String(pastDate.getDate()).padStart(2, '0');
//         days.push(`${year}-${month}-${day}`);
//     }

//     return days;
// }

function getLast30Days() {
    const dates = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    }
    return dates.reverse(); // To keep them in ascending order
}

exports.lastSales = async (req, res, next) => {
    // [Op.gte]: fn('DATE_SUB', fn('NOW'), fn('INTERVAL', 30, 'DAY'))
    try {
        const last30Days = getLast30Days();
        const salesData = await db.sales.findAll({
            attributes: [
                [fn('DATE', col('date')), 'date'],
                [fn('SUM', col('amount')), 'totalAmount'],
                [fn('SUM', col('profit')), 'totalProfit']
            ],
            where: {
                date: {
                    [Op.gte]: literal(`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
                }
            },
            group: [fn('DATE', col('date'))],
            order: [[fn('DATE', col('date')), 'ASC']]
        });

        // Convert sales data into a simpler format
        const salesMap = salesData.reduce((acc, item) => {
            const dateString = item.dataValues.date;
            acc[dateString] = {
                totalAmount: item.dataValues.totalAmount,
                totalProfit: item.dataValues.totalProfit
            };
            return acc;
        }, {});

        // Map over last 30 days and merge with sales data
        const formattedData = last30Days.map(date => {
            const salesForDate = salesMap[date] || { totalAmount: 0, totalProfit: 0 };
            return {
                date,
                totalAmount: salesForDate.totalAmount,
                totalProfit: salesForDate.totalProfit
            };
        });

        console.log(`SALES DATA : ${salesData}`);
        console.log(formattedData)
        res.json({ result: formattedData.reverse() });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching sales data.' });
    }
}

// AGGREGATED DATA
exports.lastCollection = async (req, res, next) => {
    try {
        const last30Days = getLast30Days();
        const collectionData = await db.useramountsettlement.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('debit')), 'totalAmount'],
            ],
            where: {
                createdAt: {
                    [Op.gte]: literal(`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
                },
                note: "User Credit withdrawn",
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Convert sales data into a simpler format
        const collectionMap = collectionData.reduce((acc, item) => {
            const dateString = item.dataValues.date;
            acc[dateString] = {
                totalAmount: item.dataValues.totalAmount
            };
            return acc;
        }, {});

        // Map over last 30 days and merge with sales data
        const formattedData = last30Days.map(date => {
            const collectionForDate = collectionMap[date] || { totalAmount: 0 };
            return {
                date,
                totalAmount: collectionForDate.totalAmount
            };
        });

        console.log(collectionData);
        console.log(formattedData);
        res.json({ result: formattedData.reverse() });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching sales data.' });
    }
}

// AGGREGATED DATA
exports.lastSalesResellers = async (req, res, next) => {
    // [Op.gte]: fn('DATE_SUB', fn('NOW'), fn('INTERVAL', 30, 'DAY'))
    let username = req.body.username
    try {
        const last30Days = getLast30Days();
        const salesData = await db.sales.findAll({
            attributes: [
                [fn('DATE', col('date')), 'date'],
                [fn('SUM', col('amount')), 'totalAmount'],
                [fn('SUM', col('profit')), 'totalProfit']
            ],
            where: {
                date: {
                    [Op.gte]: literal(`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
                }
            },
            group: [fn('DATE', col('date'))],
            order: [[fn('DATE', col('date')), 'ASC']]
        });

        // Convert sales data into a simpler format
        const salesMap = salesData.reduce((acc, item) => {
            const dateString = item.dataValues.date;
            acc[dateString] = {
                totalAmount: item.dataValues.totalAmount,
                totalProfit: item.dataValues.totalProfit
            };
            return acc;
        }, {});

        // Map over last 30 days and merge with sales data
        const formattedData = last30Days.map(date => {
            const salesForDate = salesMap[date] || { totalAmount: 0, totalProfit: 0 };
            return {
                date,
                totalAmount: salesForDate.totalAmount,
                totalProfit: salesForDate.totalProfit
            };
        });

        console.log(`SALES DATA : ${salesData}`);
        console.log(formattedData)
        res.json({ result: formattedData.reverse() });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching sales data.' });
    }
}


// AGGREGATED DATA
exports.lastCollectionResellers = async (req, res, next) => {
    let username = req.body.username
    try {
        const last30Days = getLast30Days();
        const collectionData = await db.useramountsettlement.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('debit')), 'totalAmount'],
            ],
            where: {
                createdAt: {
                    [Op.gte]: literal(`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
                },
                collectorId: username,
                note: "User Credit withdrawn",
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']]
        });

        // Convert sales data into a simpler format
        const collectionMap = collectionData.reduce((acc, item) => {
            const dateString = item.dataValues.date;
            acc[dateString] = {
                totalAmount: item.dataValues.totalAmount
            };
            return acc;
        }, {});

        // Map over last 30 days and merge with sales data
        const formattedData = last30Days.map(date => {
            const collectionForDate = collectionMap[date] || { totalAmount: 0 };
            return {
                date,
                totalAmount: collectionForDate.totalAmount
            };
        });

        console.log(collectionData);
        console.log(formattedData);
        res.json({ result: formattedData.reverse() });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching sales data.' });
    }
}

// AGGREGATED DATA
exports.transferredList = async (req, res, next) => {
    let username = req.body.username
    try {
        const last30Days = getLast30Days();
        const transferData = await db.agenttransferrequest.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('requested_amount')), 'amount'],
            ],
            where: {
                createdAt: {
                    [Op.gte]: literal(`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
                },
                provider_name: username,
                status: "Approved",
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'DESC']]
        });

        // Convert sales data into a simpler format
        const transferMap = transferData.reduce((acc, item) => {
            const dateString = item.dataValues.date;
            acc[dateString] = {
                totalAmount: item.dataValues.amount
            };
            return acc;
        }, {});

        // Map over last 30 days and merge with sales data
        const formattedData = last30Days.map(date => {
            const transferForDate = transferMap[date] || { totalAmount: 0 };
            return {
                date,
                totalAmount: transferForDate.totalAmount
            };
        });

        console.log(transferData);
        console.log(formattedData);
        res.json({ result: formattedData.reverse() });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching sales data.' });
    }
}

exports.resellerCustomerSalesList = async(req, res, next) => {
    let result = []
    const user = await db.user.findOne({
        where: {
            phone: req.body.username
        }
    })

    const connected_users = await db.userprofile.findAll({
        where: {
            connectedUser: user.uuid
        }
    })

    for (let profile of connected_users){
        const sales = await rechargeModule.customerSales(profile.phone)
        let object = {
            "username": profile.phone,
            "amount": sales
        }

        result.push(object)
    }

    res.json({
        result: result
    })
}

exports.customerLastSalesList = async(req, res, next) => {
    let username = req.body.username
    try {
        const last30Days = getLast30Days();
        const salesData = await db.sales.findAll({
            attributes: [
                [fn('DATE', col('date')), 'date'],
                [fn('SUM', col('amount')), 'totalAmount']
            ],
            where: {
                date: {
                    [Op.gte]: literal(`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
                },
                agent: username
            },
            group: [fn('DATE', col('date'))],
            order: [[fn('DATE', col('date')), 'DESC']]
        });

        // Convert sales data into a simpler format
        const salesMap = salesData.reduce((acc, item) => {
            const dateString = item.dataValues.date;
            acc[dateString] = {
                totalAmount: item.dataValues.totalAmount
            };
            return acc;
        }, {});

        // Map over last 30 days and merge with sales data
        const formattedData = last30Days.map(date => {
            const salesForDate = salesMap[date] || { totalAmount: 0 };
            return {
                date,
                totalAmount: salesForDate.totalAmount
            };
        });

        console.log(`SALES DATA : ${salesData}`);
        console.log(formattedData)
        res.json({ result: formattedData.reverse() });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while fetching sales data.' });
    }
}


exports.resellerDueList = async (req, res, next) => {
    let result = []
    const users = await db.user.findAll({
        where: {
            usertype: "subdealer"
        }
    })

    for (let user of users) {
        const agentprofiles = await db.userprofile.findAll({
            where: {
                connectedUser: user.uuid
            }
        })

        let total_debit = 0
        let total_credit = 0

        for (profile of agentprofiles) {
            const data = await db.useramountsettlement.findAll({
                where: {
                    userId: profile.userId,
                }
            })

            for (let i = 0; i < data.length; i++) {
                total_credit += data[i].credit
                if (data[i].note == "User Credit withdrawn") {
                    total_debit += data[i].debit
                }
            }
        }

        let due = total_credit - total_debit

        let duedata = {
            reseller: user.phone,
            due: due
        }

        result.push(duedata)
    }
    res.json({
        resellerduelist: result
    })
}

exports.customerDueList = async (req, res, next) => {
    let result = []
    let username = req.body.username
    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })
    const customers = await db.userprofile.findAll({
        where: {
            connectedUser: user.uuid
        }
    })

    for (let customer of customers) {
        let total_debit = 0
        let total_credit = 0
        const data = await db.useramountsettlement.findAll({
            where: {
                userId: customer.userId,
            }
        })

        for (let i = 0; i < data.length; i++) {
            total_credit += data[i].credit
            if (data[i].note == "User Credit withdrawn") {
                total_debit += data[i].debit
            }
        }

        let due = total_credit - total_debit

        let duedata = {
            customer: customer.phone,
            due: due
        }

        result.push(duedata)
    }

    res.json({
        customerduelist: result
    })
}



exports.apiList = async (req, res, next) => {
    let api_list = []
    const apis = await db.api.findAll()

    const apipurchase = await db.purchase.findAll()
    res.json({
        api_list: apipurchase
    })
}

exports.apiDirectory = async(req, res, next) => {
    let directory = []
    const purchases = await db.purchase.findAll()

    for (let purchase of purchases){
        const api = await db.api.findOne({
            where: {
                name: purchase.dist
            }
        })

        const plans = await db.plans.findAll({
            where: {
                api_plan_id: api.uuid
            }
        })

        let obj = {
            api: api.name,
            plans: plans
        }
        directory.push(obj)
    }

    res.json({
        result: directory
    })


}

exports.resellerCollectionHistory = async (req, res, next) => {
    const TODAY_START = moment().format('YYYY-MM-DD 00:00');
    const NOW = moment().format('YYYY-MM-DD 23:59');
    let collection_history = []
    const users = await db.user.findAll({
        where: {
            usertype: "subdealer"
        }
    })

    for (let user of users) {
        let total = 0.00

        const customers = await db.userprofile.findAll({
            where: {
                connectedUser: user.uuid
            }
        })

        for (let customer of customers) {
            const datas = await db.useramountsettlement.findAll({
                where: {
                    userId: customer.userId,
                    createdAt: {
                        [Op.gte]: TODAY_START,
                        [Op.lte]: NOW
                    }
                }
            })

            for (let data of datas) {
                total += data.debit
            }
        }

        let object = {
            user_id: user.uuid,
            username: user.phone,
            store: user.store,
            total: total
        }

        collection_history.push(object)
    }

    res.json({
        reseller_collection_history: collection_history
    })
}

exports.customerCollectionHistory = async (req, res, next) => {
    const TODAY_START = moment().format('YYYY-MM-DD 00:00');
    const NOW = moment().format('YYYY-MM-DD 23:59');
    let collection_history = []
    let username = req.body.username_reseller

    const user = await db.user.findOne({
        where: {
            phone: username
        }
    })


    const customers = await db.userprofile.findAll({
        where: {
            connectedUser: user.uuid
        }
    })

    for (let customer of customers) {
        let total = 0.00
        const datas = await db.useramountsettlement.findAll({
            where: {
                userId: customer.userId,
                createdAt: {
                    [Op.gte]: TODAY_START,
                    [Op.lte]: NOW
                }
            }
        })

        for (let data of datas) {
            total = data.debit
        }

        let object = {
            user_id: customer.userId,
            username: customer.phone,
            total: total
        }

        collection_history.push(object)
    }

    res.json({
        customer_collection_history: collection_history
    })


}



// FUNCTION: ONLY RESELLER TRANSFER LIST
exports.resellerBalanceTransferHistory = async (req, res, next) => {
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
    for (let user of users) {
        let total = 0.00

        const data = await db.useramountsettlement.findAll({
            where: {
                userId: user.uuid,
                note: "User Credit Data"
            }
        })

        if (data.length > 0) {
            for (let settle of data) {
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
exports.resellerCustomerBalanceTransferHistory = async (req, res, next) => {
    let user_id = req.body.user_id


    const userprofiles = await db.userprofile.findAll({
        where: {
            connectedUser: user_id
        }
    })

    let customers = []
    for (let profile of userprofiles) {
        let customer_total = 0.0
        const customer_data = await db.useramountsettlement.findAll({
            where: {
                userId: profile.userId,
                note: "User Credit Data"
            }
        })

        for (let credit of customer_data) {
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
exports.resellerList = async (req, res, next) => {
    const resellers = await db.user.findAll({
        where: {
            usertype: "subdealer"
        }
    })

    res.json({
        reseller_list: resellers
    })
}