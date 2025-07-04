// import express from 'express';
// import controller from '../controllers/dealerReport.js';

module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/dealerReport");
    const dealerReportRoutes = express.Router();

    dealerReportRoutes.get('/dealer', controller.dealer);
    dealerReportRoutes.get('/dealersubdealerreport/:uid', controller.dealerSubDealerReport);
    dealerReportRoutes.get('/dealersubdealeragentreport/:uid', controller.dealersubDealerAgentReport);
    dealerReportRoutes.get('/dealersubdealeragentreportpaginated/:uid', controller.dealersubDealerAgentReportPaginated);

    app.use('/', dealerReportRoutes);
}



// export default dealerReportRoutes;
