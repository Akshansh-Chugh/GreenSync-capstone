import mongoose from "mongoose"
import {DB_name} from "../constants.js"
import { asyncHandler } from "./asyncHandler.js"

const connectDB=asyncHandler(async(req,res,next)=>{

    const connection=await mongoose.connect(`process.env.MONGO_URI/${DB_name}`)
    console.log(connection.connection.host)
    next()

})


export default connectDB