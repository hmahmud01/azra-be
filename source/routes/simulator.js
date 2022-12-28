import express from 'express';
import controller from '../controllers/simulator.js'
const simulatorRoutes = express.Router();

simulatorRoutes.post('/submitdata', controller.submitData);
simulatorRoutes.get('/alltrx', controller.allTransactions);

export default simulatorRoutes;