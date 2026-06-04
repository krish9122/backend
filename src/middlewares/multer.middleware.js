// Import multer library
// multer is used for handling file uploads in Express
import multer from "multer";


// Configure storage settings for uploaded files
const storage = multer.diskStorage({

  // destination decides where uploaded files will be stored
  destination: function (req, file, cb) {

    // cb = callback function

    // first argument -> error
    // null means no error occurred

    // second argument -> folder path
    // uploaded files will be stored inside ./public/temp
    cb(null, './public/temp')
  },


  // filename decides what name the uploaded file will have
  filename: function (req, file, cb) {

    // file.originalname gives original uploaded file name
    // Example:
    // photo.png

    // Save file using original file name
    cb(null, file.originalname)
  }
})


// Create multer middleware using the above storage configuration
export const upload = multer({

  // use custom disk storage
  storage: storage
})