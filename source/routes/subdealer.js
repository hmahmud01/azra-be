import express from 'express';
import controller from '../controllers/subdealer.js';
const subDealerRoutes = express.Router();

subDealerRoutes.get('/subdealers', controller.getSubDealers);
subDealerRoutes.get('/subdealer/:id', controller.getSubDealer);
subDealerRoutes.delete('/subdealer/:id', controller.deleteSubDealer);
subDealerRoutes.put('/subdealer/:id', controller.updateSubDealer);
subDealerRoutes.post('/subdealer', controller.addSubDealer);

export default subDealerRoutes;