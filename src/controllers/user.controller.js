import asyncHandlers from "../utils/asyncHandlers.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { UploadOnClouddinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//methor to generate access and refresh tokes
const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId).select("-password -refreshToken")
    const accessTokens = user.generateAccessTokens()
    const refreshTokens = user.generateRefreshTokens()

    user.refreshToken = refreshTokens
    await user.save({ vaildateBeforeSave: false })

    return { accessTokens, refreshTokens }
}

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
    const { fullName, email, userName, password } = req.body
    // console.log("email :", email)


    // 2. validating - not empty
    if ([fullName, email, userName, password].some((field) => //here
        field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }

    // 3. checking already exist or not
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    }).select("-password")

    if (existedUser) {
        throw new ApiError(409, "User already exist")
    }

    // 4. checking images and avatar
    const avatarlocalPath = req.files?.avatar?.[0]?.path;
    // means: get the uploaded avatar file’s local file path from the request, and store it in localpath.
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarlocalPath) {
        throw new ApiError(400, "avatar file is required")
    }

    // 5. uploading avatar and coverImage in cloudinary
    const avatar = await UploadOnClouddinary(avatarlocalPath);
    const coverImage = await UploadOnClouddinary(coverImageLocalPath);
    console.log("avatar :", avatar)
    console.log("coverImage :", coverImage)
    if (!avatar) {
        throw new ApiError(400, "avatar is not uploaded")
    }

    // 6. user entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase(),
    })

    // 7. removing password and refresh tokens from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // 8. checking user creation
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while regrestring a user")
    }

    // 9. user respomse
    return res.status(201).json(
        new ApiResponse(200, createdUser, "created User created successfully")
    )

})

//to dos.
// 1. get user details from request bodey
// 2. validate not empty
// 3. check if user exist or not by email or username
// 4. if user exist then check for password is correct or not
// 5. if password is correct then generate access tokends and refresh tokens
// 6. send cookies and response

const loginUser = asyncHandlers(async (req, res) => {

    // 1. get user details from request bode
    const { email, userName, password } = req.body

    // 2. validate not empty
    if (!email && !userName) {
        throw new ApiError(400, "email or username is required")
    }

    if (!password) {
        throw new ApiError("400", "password is required")
    }

    // 3. check if user exist or not by email or username
    const user = await User.findOne({ //here user will hold _id, email, userName, password
        $or: [{ email }, { userName }]
    })
    if (!user) {
        throw new ApiError(404, "user not found ")
    }

    // 4. if user exist then check for password is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "invalid credentials")
    }

    // 5. if password is correct then generate access tokends and refresh tokens
    const { accessTokens, refreshTokens } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")//will be used

    // 6. send cookeis and response
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.
        status(200)
        .cookie("refreshTokens", refreshTokens, options)
        .cookie("accessTokens", accessTokens, options)
        .json(
            new ApiResponse(
                200,
                {
                    "refreshTokens": refreshTokens,
                    "accessTokens": accessTokens,
                },
                "user Logged in successfully"
            )
        )
})

// todos for logout
// 1. get user id from req.user
// 2. find user in db and remove refresh token from db
// 3. clear cookies
// 4. send response    

const loggedOut = asyncHandlers(async (req, res) => {
    // 1. get user id from req.user._id and set refresh token to empty string in db
    await User.findByIdAndUpdate(req.user._id, {
        $set: { refreshToken: "" },
    }, {
        new: true,// to return the updated user document after the update operation is applied.

    })
    const options = { // options for clearing cookies
        httpOnly: true,
        secure: true,
    }
    return res
        .status(200)
        .cookie("refreshTokens", options)
        .cookie("accessTokens", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"))
})

// access tokens and refresh tokens 
const refreshTokens = asyncHandlers(async (req, res) => {

    // 1. get refresh token from cookies or request body   
    const incomingRefreshToken = req.cookies?.refreshTokens || req.body?.refreshTokens;

    // 2. validate refresh token
    if (!incomingRefreshToken) { throw new ApiError(401, "Unauthorized: No refresh token provided") }

    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        if (!decodedToken) {
            throw new ApiError(401, "Unauthorized: Invalid refresh token")
        }

        const user = await User.findById(decodedToken?._id)


        if (!user) {
            throw new ApiError(401, "Unauthorized: Invalid refresh token")
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized: token is expired or invalid")
        }

        const { newRefreshToken, accessTokens } = generateAccessAndRefreshTokens(user._id)

        const option =
        {
            httpOnly: true,
            secure: true
        }

        return res.
            status(200)
            .cookie("refreshTokens", newRefreshTokens, options)
            .cookie("accessTokens", accessTokens, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        "refreshTokens": newRefreshTokens,
                        "accessTokens": accessTokens,
                    },
                    "refreshToken and accessToken send successfully"
                )
            )


    } catch (error) {
        throw new ApiError(400, error?.message || "invalid request")
    }
})

//changing Password
const changeUserPassword = asyncHandlers(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const uder = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "old password is not correct")
    }

    user.password = newPassword;
    await user.save({ vaildateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"))
})

//changing userName and Email
const changeFullNameAndEmail = asyncHandlers(async (req, res) => {

    const { fullName, email } = req.body;

    if (fullName || email) {
        throw new ApiError(400, "invalid credintials")
    }

    User.findByIdAndUpdate(req.user?._id,
        {
            $set: { fullName: fullName, email: email }
        },

        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "fullName and email changed successfully"))
})

//Updating userAvatar
const UpdateUsrAvatar = asyncHandlers(async (req, res) => {
    const avatarLocalPath = req.file?.path //here

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file path not found")
    }

    const avatar = await UploadOnClouddinary(avatarlocalPath); // avatar is an object 
    // we only need the url from avatar (avatar.url)

    if (!avatar.url) {
        throw new ApiError(400, "error while uploding avatar")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: (avatar.url)
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "avatar is Updated seccessfully"))

})

// updating coverImage
const UpdateUserCoverImage = asyncHandlers(async (req, res) => {
    const CoverImageLocalPath = req.file?.path //here

    if (!CoverImageLocalPath) {
        throw new ApiError(400, "avatar file path not found")
    }

    const coverImage = await UploadOnClouddinary(CoverImageLocalPath); // avatar is an object 
    // we only need the url from avatar (avatar.url)

    if (!CoverImage.url) {
        throw new ApiError(400, "error while uploding coverImage")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: (CoverImage.url)
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "coverImage is Updated seccessfully"))
})

// get user channel profile
const getUserChannelProfile = asyncHandlers(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username is required")
    }

    const channel = await User.aggregate([
        {
            // Match the user by username
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            // Lookup subscribers from the subscriptions collection
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            // Lookup subscriptions from the subscriptions collection
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            // Add fields to count the number of subscribers and subscriptions
            $addFields: {
                subscribersCount: { $size: "$subscribers" },
                subscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: { //here
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                userName: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "Channel profile fetched successfully"))
})

// get watched history 
const getWatchedHistory = asyncHandlers(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose. Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchedHistory.video",
                foreignField: "_id",
                as: "watchedVideos",
                pipeline: [
                    {
                        $lookup:{
                            from:"users",
                            localField:"user",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        avatar: 1,
                                        userName: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        }

    ])
    return res
    .status(200)
    .json(new ApiResponse(200, user[0]?.watchedVideos || [], "watched history fetched successfully"))
})

export { registerUser, loginUser, loggedOut, refreshTokens, changeUserPassword, changeFullNameAndEmail, UpdateUserCoverImage, UpdateUsrAvatar, getUserChannelProfile ,getWatchedHistory }
