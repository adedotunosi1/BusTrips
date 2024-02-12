const express = require('express')
const Controller = require('../controllers');

const { userLogout, requireUser } = require('../middlewares/auth.middleware');

const tripRoute = express.Router();

tripRoute.post('/new', requireUser, Controller.TripController.create_trip);
tripRoute.post('/cancel', Controller.TripController.cancel_trip);
tripRoute.get('/all', Controller.TripController.get_trips);
tripRoute.get('/data', Controller.TripController.trip_data);
tripRoute.post('/pay', Controller.TripController.trip_payment);
tripRoute.post('/track', Controller.TripController.track_trip);


module.exports = {
    tripRoute
}
