import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import countryRoutes from './routes/country.js';
import circleRoutes from './routes/circle.js';
import apiRoutes from './routes/apiIndex.js';
import agentRoutes from './routes/agent.js';
import dealerRoutes from './routes/dealer.js';
import subDealerRoutes from './routes/subdealer.js';
import serviceRoutes from './routes/service.js';
import mnoRoutes from './routes/mobilenetwork.js';
import simulatorRoutes from './routes/simulator.js';
import authRoute from './authsrc/auth/auth.routes.js';
import usersRoute from './authsrc/users/users.routes.js';
import agentReportRoutes from './routes/agentReport.js';
import orgReportRoutes from './routes/orgReport.js';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());


// var corsMiddleware = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', 'localhost:3001');
//     res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

//     next();
// }

// app.use(corsMiddleware);
// https://dev.to/mihaiandrei97/jwt-authentication-using-prisma-and-express-37nk





app.use('/', countryRoutes);
app.use('/', circleRoutes);
app.use('/', apiRoutes);
app.use('/', agentRoutes);
app.use('/', dealerRoutes);
app.use('/', subDealerRoutes);
app.use('/', serviceRoutes);
app.use('/', mnoRoutes);
app.use('/', simulatorRoutes);
app.use('/', authRoute);
app.use('/', usersRoute);
app.use('/', agentReportRoutes);
app.use('/', orgReportRoutes);

const trx = await prisma.apiTransaction.findMany({ include: {api: true} });
// console.log(trx); 

app.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(app);

console.log(process.env.JWT_ACCESS_SECRET);

const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () => console.log(`The Server is running on port ${PORT}`));