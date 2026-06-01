import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import {owner} from "../models/owner.js";

const Jwt= asyncHandler( async (req, res,next)=>
{
    const cookie= req.cookies.accessToken
    if (!cookie) throw new apiError(404,"Cookie not found")
    
    const decoded= jwt.verify(cookie,process.env.ACCESS_PWD)

    if(!decoded) throw new apiError(402,"Invalid Token")

    const user= await owner.findById(decoded._id).select("-password -refreshToken")

    if (!user) throw new apiError(404,"User not found")
    req.user=user
    next()

})
export {Jwt}