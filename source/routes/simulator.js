import express from 'express';
import controller from '../controllers/simulator.js'
const simulatorRoutes = express.Router();

// simulatorRoutes.get('/agentbalance', controller.agentBalance);
simulatorRoutes.post('/submitdata', controller.submitData);
simulatorRoutes.get('/alltrx', controller.allTransactions);
simulatorRoutes.post('/asynctest', controller.asyncTest);
simulatorRoutes.post('/asyncurl', controller.asyncURL);
simulatorRoutes.get('/allagenttrx', controller.allagentTrx);
simulatorRoutes.post('/asynchit', controller.asyncHit);
simulatorRoutes.get('/agentbalancecheck/:id', controller.agentBalance);

export default simulatorRoutes;