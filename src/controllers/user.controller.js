import asyncHandlers from "../utils/asyncHandlers.js"
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {UploadOnClouddinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

// to dos.
// 1. get user details from frontend
// 2. validation - not empty
// 3. check if user already exist
// 4. check for images , check for avatars
// 5. upload them to cloudinary , avatar
// 6. create user object - user entry in db
// 7. remove password and refresh tokens from response //why this
// 8. check for user creation 
// 9. user res

const registerUser = asyncHandlers(async (req, res) => {

    // 1. getting user details
    const {fullName , email , userName , password} = req.body
    console.log("email :",email)
    

    // 2. validating - not empty
    if ([fullName,email,userName,password].some((field)=> //here
        field?.trim() === ""))
     {
        throw new ApiError(400,"all fields are required")
    }

    // 3. checking already exist or not
    const existedUser = User.findOne({
        $or: [{ userName },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User already exist")
    }

    // 4. checking images and avatar
    const avatarlocalPath = req.files?.avatar[0]?.path;
    //means: get the uploaded avatar file’s local file path from the request, and store it in localpath.
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarlocalPath) {
        throw new ApiError(400,"avatar file is required")
    }

    // 5. uploading avatar and coverImage in cloudinary
    const avatar = await UploadOnClouddinary(avatarlocalPath);
    const coverImage = await UploadOnClouddinary(coverImageLocalPath);
    if (!avatar) {
        throw new ApiError(400,"avatar is not uploaded")
    }
    // 6. user entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.Url,
        coverImage: coverImage?.Url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    // 7. removing password and refresh tokens from response
    const createdUser = User.findById(user._id).select("-password -refreshToken")

    // 8. checking user creation
    if(!createdUser){
        throw new ApiError(500,"something went wrong while regrestring a user")
    }

    // 9. user respomse
    return res.status(201).json(
        new ApiResponse(200,createdUser,"createdUser created successfully")
    )

    })

export { registerUser }
