module.exports = app => {
    const express = require("express")
    const controller = require("../controllers/userprofile.js");

    profileRouter = express.Router();
    profileRouter.post('/user-dashboard', controller.userDashboard);
    profileRouter.post('/user-wallet-history', controller.walletHistory);

    app.use(profileRouter);
}