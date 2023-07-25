module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/plans.js');

    const planRouter = express.Router();
    planRouter.post('/createplan', controller.createPlan);
    planRouter.get('/listplan', controller.listPlan);


    app.use(planRouter);
}