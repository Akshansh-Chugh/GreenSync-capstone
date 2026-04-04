import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


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
import ownerRouter from "./routes/ownerRoute.js"
// import sensorRoute from "./routes/sensorRoute.js"
import createPlant from "./routes/plantRoute.js"

app.use("/api/v1/owner",ownerRouter)
app.use("/api/v1/plant",createPlant)
// app.use("/api/v1/plant",sensorRoute)

export default app;