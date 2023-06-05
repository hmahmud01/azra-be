module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/mobileNetwork.js")

    const mnoRoutes = express.Router();
    mnoRoutes.get('/networks', controller.getNetworks);
    mnoRoutes.get('/network/list', controller.listNetwork);
    mnoRoutes.get('/filternetwork/:id', controller.filterNetwork);
    mnoRoutes.get('/network/:id', controller.getNetwork);
    mnoRoutes.put('/network/:id', controller.updateNetwork);
    mnoRoutes.delete('/network/:id', controller.deleteNetwork);
    mnoRoutes.post('/network', controller.addNetwork);
    mnoRoutes.post('/mobilesetting', controller.mobileSetting);
    mnoRoutes.get('/findmobilesetting/:id', controller.findMobileSetting);

    app.use('/', mnoRoutes);
}