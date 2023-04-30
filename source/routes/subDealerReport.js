// import express from 'express';
// import controller from '../controllers/subDealerReport.js';

// const subDealerReportRoutes = express.Router();

// subDealerReportRoutes.get('/subdealer', controller.subDealers);
// subDealerReportRoutes.get('/agentsubdealer/:uid', controller.subDealerAgentReport);

// export default subDealerReportRoutes;

module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/subDealerReport.js"); 
    const subDealerReportRoutes = express.Router();

    subDealerReportRoutes.get('/subdealer', controller.subDealers);
    subDealerReportRoutes.get('/agentsubdealer/:uid', controller.subDealerAgentReport);

    app.use('/', subDealerReportRoutes);
}