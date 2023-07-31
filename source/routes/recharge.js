module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/recharge.js');

    const rechargeRouter = express.Router();
    rechargeRouter.post('/user-get-portal-balance', controller.userGetPortalBalance);
    rechargeRouter.post('/plans', controller.plans);
    rechargeRouter.post('/operators', controller.operators);
    rechargeRouter.post('/operator-check', controller.operatorCheck);
    rechargeRouter.post('/confirm-recharge', controller.confirmRecharge);
    rechargeRouter.post('/recharge', controller.recharge);
    rechargeRouter.post('/customer-balance-transfer-request', controller.customerBalanceTransferRequest);
    // rechargeRouter.post('/user-get-portal-balance', controller.userGetPortalBalance);

    app.use(rechargeRouter);
}