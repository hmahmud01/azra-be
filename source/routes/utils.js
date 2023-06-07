import express from 'express';
import controller from '../controllers/utils.js';
const utilRoutes = express.Router();

utilRoutes.get('/signpayload', controller.signPayload);

export default utilRoutes;