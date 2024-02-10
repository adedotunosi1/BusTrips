const fs = require('fs');
const multer = require('multer'); 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '../services/busimages');
    },
    filename: function (req, file, cb) {
      cb(null, 'busImage-' + Date.now())
    },
  });
  
  const upload = multer({ storage: storage});
  

  module.exports = {
    upload,
  };