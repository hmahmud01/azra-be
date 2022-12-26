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

const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

//CORS middleware
var corsMiddleware = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'localhost'); //replace localhost with actual host
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

    next();
}

app.use(corsMiddleware);

app.use('/', countryRoutes);
app.use('/', circleRoutes);
app.use('/', apiRoutes);
app.use('/', agentRoutes);
app.use('/', dealerRoutes);
app.use('/', subDealerRoutes);
app.use('/', serviceRoutes);
app.use('/', mnoRoutes);
app.use('/', simulatorRoutes);

app.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(app);

const PORT = process.env.PORT ?? 3000
httpServer.listen(PORT, () => console.log(`The Server is running on port ${PORT}`));