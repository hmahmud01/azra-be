module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/usercredit.js');

    const creditRouter= express.Router();
    creditRouter.post('/add-credit-info', controller.addCreditInfo);

    app.use(creditRouter);
}