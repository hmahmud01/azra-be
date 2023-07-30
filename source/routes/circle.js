module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/circle.js");

    const circleRoutes = express.Router();
    circleRoutes.post('/addcircle', controller.createCircle);
    circleRoutes.get('/circlelist', controller.listCircle);

    app.use('/', circleRoutes);
}