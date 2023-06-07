// import http from 'http';
// import express from 'express';
// import morgan from 'morgan';
// import cors from 'cors';
// import bodyParser from 'body-parser';
const http = require("http");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
// import countryRoutes from './source/routes/country.js';
// import circleRoutes from './source/routes/circle.js';
// import apiRoutes from './source/routes/apiIndex.js';
// import agentRoutes from './source/routes/agent.js';
// import dealerRoutes from './source/routes/dealer.js';
// import subDealerRoutes from './source/routes/subdealer.js';
// import serviceRoutes from './source/routes/service.js';
// import mnoRoutes from './source/routes/mobileNetwork.js';
// import simulatorRoutes from './source/routes/simulator.js';
// import authRoute from './source/authsrc/auth/auth.routes.js';
// import usersRoute from './source/authsrc/users/users.routes.js';
// import agentReportRoutes from './source/routes/agentReport.js';
// import orgReportRoutes from './source/routes/orgReport.js';
// import dealerReportRoutes from './source/routes/dealerReport.js';
// import subDealerReportRoutes from './source/routes/subDealerReport.js';

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

require('dotenv').config();

const app = express();

var corsOptions = {
    origin: "http://localhost:3001"
}

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());

const db = require("./source/models");

db.sequelize.sync()
    .then(() => {
        console.log("Synced DB.");
    })
    .catch((err) => {
        console.log("Failed to sync db: " + err.message);
    })


// https://dev.to/mihaiandrei97/jwt-authentication-using-prisma-and-express-37nk


// app.use('/', countryRoutes);
// app.use('/', circleRoutes);
// app.use('/', apiRoutes);
// app.use('/', agentRoutes);
// app.use('/', dealerRoutes);
// app.use('/', subDealerRoutes);
// app.use('/', serviceRoutes);
// app.use('/', mnoRoutes);
// app.use('/', simulatorRoutes);
// app.use('/', authRoute);
// app.use('/', usersRoute);
// app.use('/', agentReportRoutes);
// app.use('/', orgReportRoutes);
// app.use('/', subDealerReportRoutes);
// app.use('/', dealerReportRoutes);


// app.use((req, res, next) => {
//     const error = new Error('not found');
//     return res.status(404).json({
//         message: error.message
//     });
// });

app.get("/", (req, res,) => {
    res.json({message: "LOADING AZRA V2..."})
})

require("./source/routes/country")(app);
require("./source/routes/mobileNetwork")(app);
require("./source/routes/service")(app);
require("./source/routes/apiIndex")(app);
require("./source/authsrc/auth/auth.routes")(app);
require("./source/authsrc/users/users.routes")(app);
require("./source/routes/agent")(app);
require("./source/routes/agentReport")(app);
require("./source/routes/subDealerReport")(app);
require("./source/routes/dealerReport")(app);
require("./source/routes/orgReport")(app);
require("./source/routes/simulator")(app);
// require("./source/routes/utils")(app);


const httpServer = http.createServer(app);

const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () => console.log(`The Server is running on port ${PORT}`));