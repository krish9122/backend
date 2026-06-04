import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnClouddinary = async(LocalFilePath1 => {
    try {
        if (!LocalFilePath1) return null
        const response = await cloudinary.v2.uploader
            .upload("dog.mp4", {
                resource_type: "video",
                public_id: "my_dog",
                overwrite: true,
                notification_url: "https://mysite.example.com/notify_endpoint"
            })
            .then(result => console.log(result));

        return response
    }
    catch(error) {
        fs.unlinkSync(LocalFilePath1) //remove locally saved tempory file as upload operation git faild
        return null;
    }
})


cloudinary.v2.uploader
    .upload("dog.mp4", {
        resource_type: "video",
        public_id: "my_dog",
        overwrite: true,
        notification_url: "https://mysite.example.com/notify_endpoint"
    })
    .then(result => console.log(result));
    
    export {UploadOnClouddinary}