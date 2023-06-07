module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/utils.js");
    const utilRoutes = express.Router();

    utilRoutes.get('/signpayload', controller.signPayload);

    app.use('/', utilRoutes);

}