const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (req, res, file_options) => {
    try {
        const { path, file_name, destination_path } = file_options;

        if (!path || !file_name || !destination_path) {
            throw new Error('Invalid file options');
        }

        cloudinary.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const { secure_url } = await cloudinary.v2.uploader.upload(path, {
            folder: destination_path,
            public_id: file_name,
            resource_type: 'auto'
        });

        return secure_url;
    } catch (error) {
        // Handle errors appropriately
        console.error('Error uploading to Cloudinary:', error);
        throw error; // Propagate the error to the caller
    }
}


module.exports = {
    cloudinary,
    uploadToCloudinary
}