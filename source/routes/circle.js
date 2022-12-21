import express from 'express';
import controller from '../controllers/circle.js';
const circleRoutes = express.Router();

circleRoutes.get('/circles', controller.getCircles);
circleRoutes.get('/circle/:id', controller.getCircle);
circleRoutes.delete('/circle/:id', controller.deleteCircle);
circleRoutes.put('/circle/:id', controller.updateCircle);
circleRoutes.post('/circle', controller.addCircle);

export default circleRoutes;