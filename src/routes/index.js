const express = require('express');
const busTripsRouter = express.Router();
const userModule = require('./userRoute');
const authModule = require('./authRoute');

busTripsRouter.use('/user', userModule.userRoute);
busTripsRouter.use('/auth', authModule.authRoute);

module.exports = busTripsRouter;