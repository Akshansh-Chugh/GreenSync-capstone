import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {owner} from "../models/owner.js";
import { to_cloud } from "../utils/cloudinary.js";


const cookieSettings=
{
    httpOnly:true,
    secure :true
}

const registerUser=asyncHandler(async(req,res)=>
{
    

    let {name,email,phone,password,age,adhaar,totalFeilds, profile_pic}=req.body;
    

    if (!name || !email || !phone || !password) throw new apiError(400, "All fields are required")

    // store email as lowercase to avoid duplication
    email=email.toLowerCase().trim()

    if (req.files?.profile_pic?.[0]?.path)
    {
        let local_path=req.files.profile_pic[0].path
        profile_pic=await to_cloud(local_path)
    }

    const exsistingUser=await owner.findOne({
        $or:[{email},{phone}]
    })

    if (exsistingUser) throw new apiError(401,"User already exists")
    
    let newUser=await owner.create({name,email,phone,password,age,adhaar,totalFeilds, profile_pic})

    const accessToken=newUser.generateAccessToken()
    const createdUser= await owner.findByIdAndUpdate(newUser._id,                     // only updates db (local variable is untouched)
        {refreshToken: await newUser.generateRefreshToken()},
        {new:true}                                                          // new is to update local variable too
    ).select("-password")

    if (!createdUser) throw new apiError(500,"User creation failed")

    if (password === "pwd")  await owner.deleteOne({ _id: newUser._id });
    

    return res.status(200)
    .cookie("accessToken",accessToken,cookieSettings)
    .json(new apiResponse(200,createdUser,"User created Successfully"))

})

const loginUser=asyncHandler(async(req,res)=>
{
    let {email,password}=req.body
    if (!email || !password) throw new apiError(400,"All fields are required")
    const currentUser= await owner.findOne({email})
    if (!currentUser) throw new apiError(401,"User not found")
    const valid = await currentUser.isPwdCorrect(password);
    if (!valid) throw new apiError(401,"Invalid credentials")

    const accessToken=await currentUser.generateAccessToken()
    const refreshToken=await currentUser.generateRefreshToken()

    res.cookie("accessToken",accessToken,cookieSettings)
    .cookie("refreshToken",refreshToken,cookieSettings)
    .json( new apiResponse(200,currentUser))
})

export {registerUser,loginUser}