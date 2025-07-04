module.exports = app => {
    const country = require("../controllers/country");

    var router = require("express").Router();

    router.get('/countries', country.getCountries);
    router.post('/country', country.addCountry);

    app.use('/api/country', router);
}