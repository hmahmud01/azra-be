module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/apiIndex.js")
    const apiRoutes = express.Router();

    apiRoutes.get('/apis', controller.getApis);
    apiRoutes.get('/api/:id', controller.getApi);
    apiRoutes.get('/api/activate/:id', controller.activateApi);
    apiRoutes.get('/api/deactivate/:id', controller.deActivateApi);
    apiRoutes.post('/api', controller.addApi);
    apiRoutes.get('/apipercentage', controller.apiPercentageData);
    apiRoutes.get('/apipriority', controller.apiPriorityData);
    apiRoutes.post('/assign/percent', controller.assingPercentage);
    apiRoutes.post('/assign/priority', controller.assignPriority);
    apiRoutes.post('/update/priority', controller.updatePriority);
    apiRoutes.post('/update/percent', controller.updatePercentage);

    app.use('/', apiRoutes)
}
