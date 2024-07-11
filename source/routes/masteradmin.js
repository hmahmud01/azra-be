module.exports = app => {
    const express = require("express")
    const controller = require("../controllers/masteradmin.js")
    const { authMiddleWare } = require("../authsrc/auth/auth.services.js")

    masterAdminRouter = express.Router();
    masterAdminRouter.post('/sales-admin', controller.sales)
    masterAdminRouter.post('/collection-admin', controller.collection)
    masterAdminRouter.post('/earning-admin', controller.earning)
    masterAdminRouter.post('/apibalance-admin', controller.apiBalance)
    masterAdminRouter.post('/marketdue-admin', controller.marketDue)
    masterAdminRouter.post('/remainingcredit-admin', controller.remainingCredit)
    masterAdminRouter.post('/saleslist-admin', controller.salesList)
    masterAdminRouter.post('/collectionlist-admin', controller.collectionList)
    masterAdminRouter.post('/earninglist-admin', controller.earningList)
    masterAdminRouter.post('/apilist-admin', controller.apiList)
    masterAdminRouter.post('/resellerbalancetransferhistory-admin', controller.resellerBalanceTransferHistory)
    masterAdminRouter.post('/resellerlist', controller.resellerList)

    app.use(masterAdminRouter)
}