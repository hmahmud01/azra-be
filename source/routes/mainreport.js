module.exports = app => {
    const express = require("express")
    const controller = require("../controllers/mainreport.js")
    const reportRoutes = express.Router()

    reportRoutes.get("/summaryreport", controller.summary)
    reportRoutes.get("/purchasereport", controller.purchaseReport)
    reportRoutes.get("/salesreport", controller.salesReport)
    reportRoutes.get("/revenuereport", controller.revenueReport)
    reportRoutes.post("/addpurchase", controller.addPurchase)

    app.use(reportRoutes);

}