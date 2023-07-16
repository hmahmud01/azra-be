module.exports = app => {
    const express = require('express');
    const controller = require('../controllers/plans.js');

    const planRouter = express.Router();
    planRouter.post('/createplan', controller.createPlan);


    app.use(planRouter);
}