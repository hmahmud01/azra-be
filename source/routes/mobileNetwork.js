import express from 'express';
import controller from '../controllers/mobileNetwork.js';
const mnoRoutes = express.Router();

mnoRoutes.get('/networks', controller.getNetworks);
mnoRoutes.get('/network/list', controller.listNetwork);
mnoRoutes.get('/network/:id', controller.getNetwork);
mnoRoutes.put('/network/:id', controller.updateNetwork);
mnoRoutes.delete('/network/:id', controller.deleteNetwork);
mnoRoutes.post('/network', controller.addNetwork);

export default mnoRoutes;