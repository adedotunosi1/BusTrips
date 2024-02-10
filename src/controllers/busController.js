const busTripUsers = require('../models/AfriMoveUsersModel');
const { addNewBus } = require('../services');
const allAfriMoveBus = require('../models/AfriMoveBusModel');
const fs = require('fs');
const path = require('path');
const { cloudinary, uploadToCloudinary } = require('../utils/cloudinary');
const mongoose = require('mongoose')

const add_bus = async (req, res, next) => {
    const { plateNumber, manufacturer, model, year, capacity, ratings, destination, busStatus, duration, distance } = req.body;
    const id = req.user._id;
  
    try {
      const user = await busTripUsers.findOne({ _id: id });
      console.log(user);
  
      // if (!image) {
      //   return res.status(400).json({ error: "Bus Image is required!" });
      // }
  
      // const file_options = await uploadToCloudinary({
      //   file_name: image.originalname,
      //   path: image.path,
      //   destination_path: 'busimages'
      // });
  
      // // Assuming uploadToCloudinary returns necessary data, including secure_url
      // const imageURL = file_options.secure_url;
      // console.log(imageURL);
  
      // // Remove the synchronous file deletion
      // // fs.unlinkSync(image.path);
  
      const details = { plateNumber, manufacturer, model, year, capacity, busImage: '', ratings, destination, busStatus, duration, distance };
      const newBus = await addNewBus(details);
  
      return res.json({ status: "ok", message: 'Bus Added Successfully!', newBus });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }

const get_bus = async (req, res, next) => {
        
        try {
         const afriMoveBus = await allAfriMoveBus.find({ });
          
           res.json({ message: 'Your AfriMove Bus', data: afriMoveBus });

        } catch (error) {
         console.log(error);
         res.status(500).json({ message: "Internal Server Error", codeerror: error });
        }
}

const bus_image = async (req, res) => {
  const { base64, plateNumber } = req.body;
  console.log(plateNumber);
  try {

    // Find bus by busId
    const bus = await allAfriMoveBus.findOne({ plateNumber })
    console.log(bus)
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found.' });
    }

    if (!base64) {
      return res.status(400).json({ error: 'Missing required parameter - file' });
    }

    // Convert base64 image data to a buffer
    const imageBuffer = Buffer.from(base64, 'base64');

    // Create the temp directory if it doesn't exist
    const tempDirPath = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDirPath)) {
      fs.mkdirSync(tempDirPath);
    }

    // Create a temporary file path for the image
    const tempImagePath = path.join(tempDirPath, `${plateNumber}-temp-image.jpg`);

    // Write the buffer to the temporary file
    fs.writeFileSync(tempImagePath, imageBuffer);

    // Upload image to cloudinary
    cloudinary.uploader.upload(tempImagePath, async (error, result) => {
      // Delete the temporary file
      fs.unlinkSync(tempImagePath);

      if (error) {
        console.log(error);
        return res.send({ status: 'error', data: error });
      }
      console.log(result.secure_url);
      try {
        // Update busImage field and save the document
        bus.busImage = result.secure_url;
        await bus.save();

        res.send({ status: 'ok', message: 'Bus Image upload successful', data: result.secure_url });
      } catch (error) {
        console.log(error);
        res.send({ status: 'error', data: error });
      } 
    });
  } catch (error) {
    console.log(error);
    res.send({ status: 'error', data: error });
  }
}

const bus_data = async (req, res) => {
  const { busId } = req.body
  try {
    if (!busId) {
      return res.status(404).json({ error: 'Bus Id needed' });
    }
    const afriMoveBus = await allAfriMoveBus.find({busId});
    if (!afriMoveBus) {
      return res.status(404).json({ error: 'Bus not found.' });
    }
      res.json({ message: 'Your Bus Data', data: afriMoveBus });

   } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error", codeerror: error });
   }
}


module.exports = {
    add_bus,
    get_bus,
    bus_image,
    bus_data
} 