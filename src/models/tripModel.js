const mongoose = require('mongoose');

const AfriTripSchema = new mongoose.Schema({
    tripId: {
        type: String,
        default: function() {
            return this._id.toString();
        }
    },
    busId: {
        type: String,
    },
    destination: {
        type: String, 
    },
    tripDate: {
        type: String,
        ref: "users",
        required: true,
    },
    userId: {
        type: String,
        ref: "users",
        required: true,
    },
    price: {
        type: Number, 
        required: true 
    },
    status: {
        type: String,
        enum: ["pending", "active", "cancelled"],
        default: "pending",
    },
    paymentOption: {
        type: String,
        enum: ["cash", "online", "paylater"],
        default: "cash",
    },
    tripNumber: {
        type: String, 
    },
    seatNumber: {
        type: Number
    }
},
{ timestamps: true }
)

const AfriMoveTrip = mongoose.model('AfriMoveTrip', AfriTripSchema);
module.exports = AfriMoveTrip;