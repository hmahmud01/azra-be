module.exports = app => {
    const express = require("express")
    const controller = require("../controllers/userprofile.js");

    profileRouter = express.Router();
    profileRouter.post('/user-dashboard', controller.userDashboard);
    profileRouter.post('/user-wallet-history', controller.walletHistory);
    profileRouter.post('/order-history', controller.orderHistory);
    profileRouter.post('/sales-dashboard', controller.salesDashboard);
    profileRouter.post('/salesman-transaction-history', controller.salesmanTransactionHistory);
    profileRouter.post('/reseller-dashboard', controller.resellerDashboard);

    app.use(profileRouter);
}