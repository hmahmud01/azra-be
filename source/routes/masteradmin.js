module.exports = app => {
    const express = require("express")
    const controller = require("../controllers/masteradmin.js")
    const { authMiddleWare } = require("../authsrc/auth/auth.services.js")

    masterAdminRouter = express.Router();
    masterAdminRouter.get('/sales-admin', controller.sales)
    masterAdminRouter.get('/collection-admin', controller.collection)
    masterAdminRouter.get('/earning-admin', controller.earning)
    masterAdminRouter.get('/apibalance-admin', controller.apiBalance)
    masterAdminRouter.get('/marketdue-admin', controller.marketDue)
    masterAdminRouter.get('/remainingcredit-admin', controller.remainingCredit)
    masterAdminRouter.get('/saleslist-admin', controller.salesList)
    masterAdminRouter.get('/collectionlist-admin', controller.collectionList)
    masterAdminRouter.get('/earninglist-admin', controller.earningList)
    masterAdminRouter.get('/apilist-admin', controller.apiList)
    masterAdminRouter.get('/resellerbalancetransferhistory-admin', controller.resellerBalanceTransferHistory)

    app.use(masterAdminRouter)
}