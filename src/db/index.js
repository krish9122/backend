import mongoose from "mongoose";
import { DB_NAME } from "../constains.js"; //here

const connectDB = async () => {
  //here
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    ); //here
    console.log(
      `\n database connected !!! DB host : ${connectionInstance.connection.host}`,
    ); //here
  } catch (error) {
    //here
    console.log("connection error", error);
    process.exit(1); //here
  }
};

export default connectDB;
