module.exports = app => {
    const express = require("express")
    const controller = require("../controllers/mainreport.js")
    const reportRoutes = express.Router()

    reportRoutes.get("/summaryreport", controller.summary)
    reportRoutes.get("/purchasereport", controller.purchaseReport)
    reportRoutes.get("/purchasehistoryreport", controller.purchaseHistoryReport)
    reportRoutes.get("/salesreport", controller.salesReport)
    reportRoutes.get("/revenuereport", controller.revenueReport)
    reportRoutes.post("/addpurchase", controller.addPurchase)
    reportRoutes.get("/collection", controller.collection)
    reportRoutes.post("/filtersummaryreport", controller.filterSummaryReport)
    reportRoutes.post("/filterpurchasereport", controller.filterPurchaseReport)
    reportRoutes.post("/filtersalesreport", controller.filterSalesReport)
    reportRoutes.post("/filterrevenuereport", controller.filterRevenueReport)
    reportRoutes.post("/filtercollection", controller.filterCollection)

    app.use(reportRoutes);

}