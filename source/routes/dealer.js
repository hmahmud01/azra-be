import express from 'express';
import controller from '../controllers/dealer.js'
const dealerRoutes = express.Router();

dealerRoutes.get('/dealers', controller.getDealers);
dealerRoutes.get('/dealer/:id', controller.getDealer);
dealerRoutes.delete('/dealer/:id', controller.deleteDealer);
dealerRoutes.put('/dealer/:id', controller.updateDealer);
dealerRoutes.post('/dealer', controller.addDealer);

export default dealerRoutes;