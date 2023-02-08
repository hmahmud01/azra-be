import express from 'express';
import controller from '../controllers/agent.js'
const agentRoutes = express.Router();

agentRoutes.get('/agents', controller.getAgents);
agentRoutes.get('/agent/:id', controller.getAgent);
agentRoutes.delete('/agent/:id', controller.deleteAgent);
agentRoutes.put('/agent/:id', controller.updateAgent);
agentRoutes.post('/agent', controller.addAgent);
agentRoutes.post('/balancetransfer', controller.balanceTransfer);
agentRoutes.post('/assignPercent/:id', controller.assignPercent);
agentRoutes.post('/settledebt/:id', controller.settleDebt);

export default agentRoutes;