import express from 'express';
import controller from '../controllers/country.js';
const countryroutes = express.Router();

countryroutes.get('/countries', controller.getCountries);
countryroutes.get('/country/list', controller.listCountry);
countryroutes.get('/country/:id', controller.getCountry);
countryroutes.put('/country/:id', controller.updateCountry);
countryroutes.delete('/country/:id', controller.deleteCountry);
countryroutes.post('/country', controller.addCountry);

export default countryroutes;