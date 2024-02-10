const busTripUsers = require('../models/AfriMoveUsersModel');
const { addNewBus } = require('../services');
const allAfriMoveBus = require('../models/AfriMoveBusModel');

const { cloudinary, uploadToCloudinary } = require('../utils/cloudinary');

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
    try {
        const busId = req.body;
        const imageUrl = req.file; // Cloudinary URL of the uploaded image
    
        // Update the bus document with the Cloudinary image URL
        const updatedBus = await Bus.findByIdAndUpdate(
          busId,
          { busImage: imageUrl },
          { new: true }
        );
    
        res.json(updatedBus);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to upload image' });
      }
}

module.exports = {
    add_bus,
    get_bus
} 