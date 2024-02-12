const AfriMoveUsers = require("../models/AfriMoveUsersModel");
const AfriMoveBooking = require("../models/bookingModel");

const get_allbookings = async (req,res) => {
    const userId = req.user._id;
    try {
        const user = await AfriMoveUsers.findOne({_id: userId});
        console.log(user);
        if(user.is_admin === false){
            return res.status(404).json({ error: 'Only Admin Can Fetch!' });
        }
        const userBooking = await AfriMoveBooking.find({});
        if (!userBooking) {
            return res.status(404).json({ error: 'No Booking!' });
          }
          res.json({ message: 'All Bookings', data: userBooking });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Internal Server Error", message: error});
    }
}

const get_userbookings = async (req, res) => {
    const userId = req.user._id;
    try {
        const userBookings = await AfriMoveBooking.find({userId});
        if (!userBookings) {
            return res.status(404).json({ error: 'No Data' });
          }
          res.json({ message: 'Your Bookings', data: userBookings });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: "Internal Server Error", message: error});
    }
}

module.exports = {
    get_allbookings,
    get_userbookings
}