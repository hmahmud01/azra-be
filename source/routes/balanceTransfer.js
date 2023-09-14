module.exports = app => {
    const express = require("express");
    const controller = require("../controllers/balanceTransfer.js"); 
    const balanceTransferRoutes = express.Router();

    balanceTransferRoutes.post('/customer-balance-transfer-request-list', controller.customerBalanceTransferRequestList);
    balanceTransferRoutes.post('/salesman-balance-transfer', controller.salesmanBalanceTransfer);
    balanceTransferRoutes.post('/reseller-balance-transfer', controller.resellerBalanceTransfer);
    balanceTransferRoutes.post('/balance-transfer-sub-customer', controller.resellerBalanceTransfer);
    balanceTransferRoutes.post('/customer-balance-transfer-request', controller.createBalanceTransfer);
    balanceTransferRoutes.post('/approve-transfer', controller.approveTransfer);
    balanceTransferRoutes.post('/decline-transfer', controller.declineTransfer);
    balanceTransferRoutes.post('/get-user-outstanding', controller.getUserOutstanding);
    balanceTransferRoutes.post('/cash-withdrawal', controller.cashWithdrawal);
    balanceTransferRoutes.post('/gt-cust-receipt-info', controller.getCustReceiptInfo);
    balanceTransferRoutes.post('/reseller-payment-collect', controller.resellerPaymentCollection);

    app.use('/', balanceTransferRoutes);
}