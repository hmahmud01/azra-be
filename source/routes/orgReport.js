import express from 'express';
import controller from '../controllers/orgReport.js';

const orgReportRoutes = express.Router();

orgReportRoutes.get('/orgreports', controller.orgReport);
orgReportRoutes.get('/alltransactions', controller.allTransactions);

export default orgReportRoutes;