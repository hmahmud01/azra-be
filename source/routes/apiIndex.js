import express from 'express';
import controller from '../controllers/apiIndex.js';
const apiRoutes = express.Router();

apiRoutes.get('/apis', controller.getApis);
apiRoutes.get('/api/:id', controller.getApi);
apiRoutes.get('/api/activate/:id', controller.activateApi);
apiRoutes.get('/api/deactivate/:id', controller.deActivateApi);
apiRoutes.post('/api', controller.addApi);
apiRoutes.get('/apipercentage', controller.apiPercentageData);
apiRoutes.get('/apipriority', controller.apiPriorityData);
apiRoutes.post('/assign/percent', controller.assingPercentage);
apiRoutes.post('/assign/priority', controller.assignPriority);

export default apiRoutes;