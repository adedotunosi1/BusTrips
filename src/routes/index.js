const express = require('express');
const busTripsRouter = express.Router();
const userModule = require('./userRoute');
const authModule = require('./authRoute');
const tripModule = require('./tripRoute');
const bookingModule = require('./bookingRoute');

busTripsRouter.use('/user', userModule.userRoute);
busTripsRouter.use('/auth', authModule.authRoute);
busTripsRouter.use('/trip', tripModule.tripRoute);
busTripsRouter.use('/booking', bookingModule.bookingRoute);

module.exports = busTripsRouter;