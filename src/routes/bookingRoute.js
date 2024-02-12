const express = require('express')
const Controller = require('../controllers');

const { userLogout, requireUser } = require('../middlewares/auth.middleware');

const bookingRoute = express.Router();

bookingRoute.get('/all-users', Controller.BookingController.get_allbookings);
bookingRoute.get('/myuser', Controller.BookingController.get_userbookings);

module.exports = {
    bookingRoute
}
