import express from 'express';
import controller from '../controllers/service.js';
const serviceRoutes = express.Router();

serviceRoutes.get('/services', controller.getServices);
serviceRoutes.get('/service/list', controller.listService);
serviceRoutes.get('/service/:id', controller.getService);
serviceRoutes.put('/service/:id', controller.updateService);
serviceRoutes.delete('/service/:id', controller.deleteService);
serviceRoutes.post('/service/:id', controller.addService);

export default serviceRoutes;