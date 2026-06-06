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
        const response = await cloudinary.v2.uploader
            .upload(LocalFilePath1, {
                resource_type: "video",
                overwrite: true
            })

        return response
    }

    catch (error) {
        fs.unlinkSync(LocalFilePath1) //remove locally saved tempory file as upload operation failed
        return null;
    }
}

export { UploadOnClouddinary }