module.exports = app => {
    const express = require('express')
    const controller = require('../controllers/planding.js')

    const dingRouter = express.Router();

    dingRouter.post('/adddingplan', controller.createdingplan);
    dingRouter.get('/listdingplan', controller.listdingplan);

    app.use(dingRouter);
}