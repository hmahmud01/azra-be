module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/currency.js');

    const currencyRouter = express.Router();
    currencyRouter.post('/addcurrency', controller.addCurrency);
    currencyRouter.get('/listcurrency', controller.listCurrency);
    currencyRouter.post('/findcurrency', controller.findCurrency);

    app.use(currencyRouter);
}