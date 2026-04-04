import { asyncHandler } from "../utils/asyncHandler.js";
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
    console.log(req.body)

    let {name,email,phone,password,age,adhaar,totalFeilds, profile_pic}=req.body;
    console.log(req.body)

    if (!name || !email || !phone || !password) throw new apiError(400, "All fields are required")

    // store email as lowercase to avoid duplication
    email=email.toLowerCase().trim()

    const exsistingUser=await owner.findOne({
        $or:[{email},{phone}]
    })

    if (exsistingUser) throw new apiError(401,"User already exists")
    
    let newUser=await owner.create({name,email,phone,password,age,adhaar,totalFeilds, profile_pic})

    const accessToken=newUser.generateAccessToken()
    const createdUser= await owner.findByIdAndUpdate(newUser._id,                     // only updates db (local variable is untouched)
        {refreshToken:newUser.generateRefreshToken()},
        {new:true}                                                          // new is to update local variable too
    ).select("-password")

    if (!createdUser) throw new apiError(500,"User creation failed")

    if (password === "pwd")  await owner.deleteOne({ _id: newUser._id });
    

    return res.status(200)
    .cookie("accessToken",accessToken,cookieSettings)
    .json(new apiResponse(200,createdUser,"User created Successfully"))

})

export {registerUser}