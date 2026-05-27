import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        Lowercase: true,
        trim: true,
        index: true
    },

       email: {
        type: String,
        required: true,
        unique: true,
        Lowercase: true,
        trim: true,
    },

       fullName: {
        type: String,
        required: true,
        Lowercase: true,
        trim: true,
        index: true
    },

       avatar: {
        type: String, //cloudnary url
        required: true,
    },
       userName: {
        type: String, //cloudnary url
        required: true, 
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref:"video"
        }
    ],

    password: {
        type: String,
        required: [true , 'password is required'],

    }
},
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }
    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.method.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User", userSchema)