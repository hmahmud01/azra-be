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

require('dotenv').config();

const app = express();

var corsOptions = {
    origin: "http://localhost:3001"
}

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());
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


app.get("/", (req, res,) => {
    res.json({message: "LOADING AZRA V2..."})
})

require("./source/routes/circle")(app);
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
require("./source/routes/utils")(app);
require("./source/routes/recharge")(app);
require("./source/routes/plans")(app);
require("./source/routes/currency")(app);
require("./source/routes/userProfile")(app);

const httpServer = http.createServer(app);

const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () => console.log(`The Server is running on port ${PORT}`));