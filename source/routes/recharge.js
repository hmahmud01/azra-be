module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/recharge.js');
    const { authMiddleware } = require("../authsrc/auth/auth.services.js");

    const rechargeRouter = express.Router();
    rechargeRouter.post('/user-get-portal-balance',authMiddleware, controller.userGetPortalBalance);
    rechargeRouter.post('/plans',authMiddleware, controller.plans);
    rechargeRouter.post('/operators',authMiddleware, controller.operators);
    rechargeRouter.post('/operator-check',authMiddleware, controller.operatorCheck);
    rechargeRouter.post('/confirm-recharge', authMiddleware, controller.confirmRecharge);
    rechargeRouter.post('/recharge', authMiddleware, controller.recharge);
    rechargeRouter.post('/opptest', controller.opptest);
    rechargeRouter.post('/opppin', controller.oppPin);
    rechargeRouter.post('/oppets', controller.oppets);
    rechargeRouter.post('/oppetsnba', controller.oppetsnba);
    rechargeRouter.post('/oppdu', controller.oppdu);  
    // rechargeRouter.post('/customer-balance-transfer-request', controller.customerBalanceTransferRequest);
    // rechargeRouter.post('/user-get-portal-balance', controller.userGetPortalBalance);

    app.use(rechargeRouter);
}