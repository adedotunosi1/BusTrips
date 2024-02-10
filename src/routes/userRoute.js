const express = require('express');
const { upload } = require('../utils/multerConfig');
const Controller = require('../controllers');
const { requireUser } = require('../middlewares/auth.middleware');

const userRoute = express.Router();

userRoute.post('/imageUpload', requireUser, upload.single('profileImage'), Controller.UserController.userImage);
userRoute.get('/data', requireUser, Controller.UserController.userData);
userRoute.post('/add-bus', requireUser, upload.single('image'), Controller.BusController.add_bus);
userRoute.get('/bus', requireUser, Controller.BusController.get_bus);
module.exports = {
    userRoute,
}