module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/service.js");

    const serviceRoutes = express.Router();
    serviceRoutes.get('/services', controller.getServices);
    serviceRoutes.get('/service/list', controller.listService);
    serviceRoutes.get('/filterservice/:id', controller.filterServices);
    serviceRoutes.get('/service/:id', controller.getService);
    serviceRoutes.put('/service/:id', controller.updateService);
    serviceRoutes.delete('/service/:id', controller.deleteService);
    serviceRoutes.post('/service', controller.addService);

    app.use('/', serviceRoutes);
}