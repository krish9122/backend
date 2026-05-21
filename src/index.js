import dns from "node:dns";
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

dns.setServers(["8.8.8.8", "1.1.1.1"]);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.log("connection error !!!...", err);
  });
