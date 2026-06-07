import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnClouddinary = async (LocalFilePath1) => {
    try {
        if (!LocalFilePath1) return null
        const response = await cloudinary.uploader
            .upload(LocalFilePath1, {
                resource_type: "auto",//this allows uploader to autamaticallt detect  the type of file and upload accordingly
                overwrite: true
            })

        // remove local temp file after successful upload (if exists)
        try {
            if (fs.existsSync(LocalFilePath1)) fs.unlinkSync(LocalFilePath1)
        } catch (e) {
            // ignore cleanup errors
        }

        return response
    }

    catch (error) {
        console.error("UploadOnClouddinary error:", error)
        try {
            if (LocalFilePath1 && fs.existsSync(LocalFilePath1)) fs.unlinkSync(LocalFilePath1)
        } catch (e) {
            // ignore cleanup errors
        }
        return null;
    }
}

export { UploadOnClouddinary }