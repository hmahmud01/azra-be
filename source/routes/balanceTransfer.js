module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/balanceTransfer.js"); 
    const balanceTransferRoutes = express.Router();

    balanceTransferRoutes.post('/customer-balance-transfer-request-list', controller.customerBalanceTransferRequestList);
    balanceTransferRoutes.post('/salesman-balance-transfer', controller.salesmanBalanceTransfer);
    balanceTransferRoutes.post('/customer-balance-transfer-request', controller.createBalanceTransfer);
    balanceTransferRoutes.post('/approve-transfer', controller.approveTransfer);
    balanceTransferRoutes.post('/decline-transfer', controller.declineTransfer);

    app.use('/', balanceTransferRoutes);
}