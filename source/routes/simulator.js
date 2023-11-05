// import express from 'express';
// import controller from '../controllers/simulator.js'

module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/simulator.js");
    const simulatorRoutes = express.Router();

    // simulatorRoutes.get('/agentbalance', controller.agentBalance);
    simulatorRoutes.post('/submitdata', controller.submitData);
    simulatorRoutes.get('/alltrx', controller.allTransactions);
    simulatorRoutes.post('/asynctest', controller.asyncTest);
    simulatorRoutes.post('/asyncurl', controller.asyncURL);
    simulatorRoutes.post('/etisalattest', controller.etisalatTest);
    simulatorRoutes.post('/zolotest', controller.zoloTest);
    simulatorRoutes.get('/allagenttrx', controller.allagentTrx);
    simulatorRoutes.post('/asynchit', controller.asyncHit);
    simulatorRoutes.get('/agentbalance/:id', controller.agentBalance);

    app.use('/', simulatorRoutes);
}


// export default simulatorRoutes;