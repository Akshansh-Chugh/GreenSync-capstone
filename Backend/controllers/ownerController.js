import { asyncHandler } from "../utils/asyncHandler";
import {apiResponse} from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {owner} from "../models/owner.js";


const cookieSettings=
{
    httpOnly:true,
    secure :true
}

const registerUser=asyncHandler(async(req,res)=>
{

    const {name,email,phone,password,age,adhaar,totalFeilds, profile_pic}=req.body;

    if (!name || !email || !phone || !password) throw new apiError(400, "All fields are required")

    // store email as lowercase to avoid duplication
    email=email.toLowerCase().trim()

    const exsistingUser=await owner.findOne({
        $or:[{email},{phone}]
    })

    if (exsistingUser) throw new apiError(401,"User already exists")
    
    let newUser=await owner.create({name,email,phone,password,age,adhaar,totalFeilds, profile_pic})

    const createdUser= await owner.findByIdAndUpdate(newUser._id,                     // only updates db (local variable is untouched)
        {refreshToken:createdUser.generateRefreshToken()},
        {new:true}                                                          // new is to update local variable too
    ).select("-password")

    if (!createdUser) throw new apiError(500,"User creation failed")

    return res.status(200).json(
        new apiResponse(200,createdUser,"User created Successfully")
    )
})