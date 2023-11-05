module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/utils.js");
    const utilRoutes = express.Router();

    utilRoutes.get('/signpayload', controller.signPayload);
    utilRoutes.get('/getsignpayload', controller.getSignPayload);

    app.use('/', utilRoutes);

}