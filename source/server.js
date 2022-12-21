import http from 'http';
import express from 'express';
import morgan from 'morgan';
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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With, Content-Type, Accept, Authorization');
    // if (req.method === 'OPTIONS'){
    //     res.header('Access-Control-Allow-Methods', 'GET PUT DELETE POST');
    //     return res.status(200).json({});
    // }
    next();
});

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