module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/recharge.js');

    const rechargeRouter = express.Router();
    rechargeRouter.post('/user-get-portal-balance', controller.getWalletBalane);
    rechargeRouter.post('/plans', controller.plans);
    rechargeRouter.post('/operator-check', controller.operatorCheck);
    rechargeRouter.post('/recharge', controller.recharge);

    app.use(rechargeRouter);
}