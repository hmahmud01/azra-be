import express from 'express';
import controller from '../controllers/agentReport.js';

const agentReportRoutes = express.Router();

agentReportRoutes.get('/agentreport', controller.agentReport);
agentReportRoutes.get('/agentprofilereport/:id', controller.agentProfileReport);
agentReportRoutes.get('/agentbalancecheck/:id', controller.agentBalance);
agentReportRoutes.get('/agentdues/:id', controller.agentDues);
agentReportRoutes.get('/agentearning/:id', controller.agentEarning);
agentReportRoutes.get('/agentrecharge/:id', controller.agentRecharge);
agentReportRoutes.get('/agentsale/:id', controller.agentSale);

export default agentReportRoutes;