const mongoose = require('mongoose');

const AfriBookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        default: function() {
            return this._id.toString();
        }
    },
    tripId: {
        type: String, 
    },
    userId: {
        type: String,
        ref: "users",
        required: true,
    }
},
{ timestamps: true }
)

const AfriMoveBooking = mongoose.model('AfriMoveBooking', AfriBookingSchema);
module.exports = AfriMoveBooking;