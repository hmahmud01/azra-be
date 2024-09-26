module.exports = app => {
    const express = require("express")
    const controller = require("../controllers/userprofile.js");
    const { authMiddleware } = require("../authsrc/auth/auth.services.js");

    profileRouter = express.Router();
    profileRouter.post('/user-dashboard',authMiddleware, controller.userDashboard);
    profileRouter.post('/user-wallet-history', controller.walletHistory);
    profileRouter.post('/order-history', authMiddleware, controller.orderHistory);
    profileRouter.post('/salesman-dashboard', controller.salesDashboard);
    profileRouter.post('/get-all-users', controller.getAllUsers);
    profileRouter.post('/salesman-transaction-history', controller.salesmanTransactionHistory);
    profileRouter.post('/salesman-wallet-history', controller.salesmanWalletHistory);
    profileRouter.post('/send-balance-to-sales', controller.sendBalanceToSales);
    profileRouter.post('/subreseller-dashboard', controller.resellerDashboard);

    app.use(profileRouter);
}