const mongoose = require('mongoose');

const AfriMoveBusSchema = new mongoose.Schema({
    busId: {
        type: String,
        default: function() {
            return this._id.toString();
        }
    },
    plateNumber: {
        type: String,
        required: [true, "Plate Number is required"]
    },
    manufacturer: {
        type: String,
        required: [true, "Manufacturer is required"],
    },
    model: {
        type: String,
        required: [true, "Model is required"]
    },
    year: {
        type: String,
        required: [true, "Year is required"]
    },
    capacity: {
        type: Number,
        required: [true, "Capacity is required"]
    },
    busImage: {
        type: String,
        required: false,
    },
    busStatus: {
        type: String,
        enum: ["available", "booked", "en-route", "unavailable"],
        default: "available",
    },
    ratings: {
        type: Number, 
        required: [true, "Ratings is required"]
    },
    destination: {
        type: String,
        required: [true, "Destination is required"]
    },
    duration: {
        type: String,
    },
    distance: {
        type: String,
    }

},
{ timestamps: true }
);

const AfriMoveBus = mongoose.model('AfriMoveBus', AfriMoveBusSchema);
module.exports = AfriMoveBus;
