// import express from 'express';
// import controller from '../controllers/orgReport.js';

module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/orgReport.js");
    const orgReportRoutes = express.Router();

    orgReportRoutes.get('/orgreports', controller.orgReport);
    orgReportRoutes.get('/alltransactions', controller.allTransactions);
    orgReportRoutes.get('/nonrefundedtrx', controller.nonRefundedTrx);
    orgReportRoutes.get('/trxdetail/:id', controller.trxDetail);
    orgReportRoutes.get('/alladjustments', controller.allAdjusmtments);
    orgReportRoutes.post('/filtertrx', controller.filterTrx);
    orgReportRoutes.get('/systemlog', controller.systemLog);

    app.use('/', orgReportRoutes);

}



// export default orgReportRoutes;