const busData = require('../models/AfriMoveBusModel');


exports.addbus = async (details) => {
    try {
        const newBus = await busData.create({...details});
        if(!newBus)
        return {error: "Bus Registration Failed"};
        return newBus;
    } catch (error) {
        console.log(error)
        return {error}
    }
}