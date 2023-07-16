module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/currency.js');

    const currencyRouter = express.Router();
    currencyRouter.post('/addcurrency', controller.addCurrency);


    app.use(currencyRouter);
}