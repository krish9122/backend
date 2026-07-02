import { Router } from "express";
import {
    registerUser,
    loginUser,
    loggedOut,
    refreshTokens,
    changeUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchedHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser)

userRouter.route("/login").post(loginUser)

// this route is used to log out the user by clearing the access token and refresh token from the cookies. 
userRouter.route("/logout").post(verifyJWT, loggedOut)

userRouter.route("/refresh-token").post(refreshTokens)

userRouter.route("/change-password").post(verifyJWT, changeUserPassword)

userRouter.route("/current-user").get(verifyJWT, getCurrentUser)

userRouter.route("/update-account").patch(verifyJWT, updateAccountDetails)

userRouter.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

userRouter.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

userRouter.route("/channel/:username").get(verifyJWT, getUserChannelProfile)

userRouter.route("/history").get(verifyJWT, getWatchedHistory)

export default userRouter;
