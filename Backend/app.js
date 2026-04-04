import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { registerUser } from "./controllers/ownerController.js";


const app = express()
app.use(cors(process.env.CHUGH_CORS_ORIGIN))

app.use(express.json(
    {
        limit:"128kb"
    }
))

app.use (express.urlencoded(
    {
        extended:true,
        limit:"128kb"
    }
))

app.use(cookieParser())
app.use(express.static("public"))

//import routes
app.post("/api/v1/create",registerUser)

export default app;