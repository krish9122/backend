import cookieParser from "cookie-parser";

// CORS allows frontend and backend from different origins to communicate
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({

    // Allows requests only from this frontend URL
    // Example:
    // http://localhost:3000
    origin: process.env.CORS_ORIGIN,

    // Allows cookies, authorization headers, sessions etc.
    // to be sent between frontend and backend
    credentials: true,
  }),
);

// Converts incoming JSON request body into JavaScript object
app.use(
  express.json({limit: "16kb",})
);

app.use(express.static("public"));

// Reads cookies sent by browser
// and stores them inside req.cookies
app.use(cookieParser());
// req.cookies.token

export default app;