module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/country.js");

    const countryRoutes = express.Router();
    countryRoutes.get('/countries', controller.getCountries);
    countryRoutes.get('/country/list', controller.listCountry);
    countryRoutes.get('/country/:id', controller.getCountry);
    countryRoutes.post('/country', controller.addCountry);

    app.use('/', countryRoutes);
}