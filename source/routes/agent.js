import express from 'express';
import controller from '../controllers/agent.js'
const agentRoutes = express.Router();

agentRoutes.get('/agents', controller.getAgents);
agentRoutes.get('/all', controller.allUserList);
agentRoutes.get('/agent/:id', controller.getAgent);
agentRoutes.delete('/agent/:id', controller.deleteAgent);
agentRoutes.put('/agent/:id', controller.updateAgent);
agentRoutes.post('/agent', controller.addAgent);
agentRoutes.post('/balancetransfer/:id', controller.balanceTransfer);
agentRoutes.post('/assignpercent/:id', controller.assignPercent);
agentRoutes.post('/settledebt/:id', controller.settleDebt);
agentRoutes.get('/data/transfer/:id', controller.transferData);
agentRoutes.get('/data/withdrawal/:id', controller.withdrawData);
agentRoutes.get('/data/percent/:id', controller.percentData);
agentRoutes.get('/perc', controller.percTest);
agentRoutes.get('/org', controller.orgTest);
agentRoutes.get('/user/information/:id', controller.information);
agentRoutes.get('/adjustments/:id', controller.adjustments);
agentRoutes.post('/trxrefund', controller.trxRefund);

export default agentRoutes;