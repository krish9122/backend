import { Router } from "express";
import { registerUser, loginUser, loggedOut } from "../controllers/user.controller.js";
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

export { userRouter };
