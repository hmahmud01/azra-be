module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/usercredit.js');

    const creditRouter= express.Router();
    creditRouter.post('/add-credit-info', controller.addCreditInfo);
    creditRouter.get('/credit-list', controller.creditList);

    app.use(creditRouter);
}