module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/plans.js');

    const planRouter = express.Router();
    planRouter.post('/createplan', controller.createPlan);
    planRouter.post('/dummyplan', controller.dummyPlan);
    planRouter.get('/listplan', controller.listPlan);
    planRouter.post('/createplantype', controller.createPlanType);
    planRouter.get('/listplantype', controller.listPlanType);

    app.use(planRouter);
}