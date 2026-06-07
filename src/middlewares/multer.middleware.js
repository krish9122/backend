// Import multer library
// multer is used for handling file uploads in Express
import multer from "multer";
import fs from "fs";
import path from "path";


// Configure storage settings for uploaded files
const storage = multer.diskStorage({

  // destination decides where uploaded files will be stored
  destination: function (req, file, cb) {
    // ensure temp directory exists
    const uploadDir = path.resolve('public', 'temp')
    try {
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
    } catch (e) {
      return cb(e)
    }

    cb(null, uploadDir)
  },


  // filename decides what name the uploaded file will have
  filename: function (req, file, cb) {
    // prefix with timestamp to avoid collisions
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})


// Create multer middleware using the above storage configuration
export const upload = multer({

  // use custom disk storage
  storage: storage
})