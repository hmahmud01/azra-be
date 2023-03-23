import express from 'express';
import controller from '../controllers/dealerReport.js';

const dealerReportRoutes = express.Router();

dealerReportRoutes.get('/dealer', controller.dealer);
dealerReportRoutes.get('/dealersubdealerreport/:uid', controller.dealerSubDealerReport);
dealerReportRoutes.get('/dealersubdealeragentreport/:uid', controller.dealersubDealerAgentReport);

export default dealerReportRoutes;
