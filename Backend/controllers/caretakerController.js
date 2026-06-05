import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {caretaker} from "../models/caretaker.js"
import { to_cloud ,cloud_del} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";
import Check_required_fields from "../checks/ownerCheck.js"

const create = asyncHandler(async (req,res)=>
{
    const cookieSettings=
{
    httpOnly:true,
    secure :true
}

    const { name,email,phone, password, age, qualification, adhaar, profilePic} = req.body

    if(!name || !email || !phone || !password || !qualification || !adhaar)
        throw new apiError(400, "Enter all details")

    const exsistingUser=await caretaker.findOne({
            $or:[{email},{phone}]
        })
    
        if (exsistingUser) throw new apiError(401,"User already exists")
        if (req.files?.profile_pic?.[0]?.path)
        {
            let local_path=req.files.profile_pic[0].path
            profile_pic=await to_cloud(local_path)
        }
        
        let newUser=await caretaker.create({name,email,phone, password, age, qualification, adhaar, profilePic})

        const accessToken=await newUser.generateAccessToken()
        const refreshToken= await newUser.generateRefreshToken()
        const createdUser= await caretaker.findByIdAndUpdate(newUser._id,                     // only updates db (local variable is untouched)
            {refreshToken: refreshToken},
            {returnDocument:'after'}                                                          // new is to update local variable too
        ).select("-password -refreshToken -__v -updatedAt")
    
        if (!createdUser) throw new apiError(500,"User creation failed")
    
        if (password === "pwd"|| !accessToken || !refreshToken)  await caretaker.deleteOne({ _id: newUser._id });
        
    
        return res.status(200)
        .cookie("accessToken",accessToken,cookieSettings)
        .cookie("refreshToken",refreshToken,cookieSettings)
        .json(new apiResponse(200,createdUser,"User created Successfully"))
    
    })

export {create, // same are owner
    // deleteCaretaker, //auth , verify pwd, notify customer, del caretaker table , del customer table, plant.direct caretaker control=0
    // updateCaretaker, // same as owner
    // login, // same
    // logout, // same
    // changePwd, //same
    // changeProfile, //same
    // leavePlant, // auth, plant in customer and accept=1 , notify , del customer
    // acceptReq, // auth , plant in customer & accept, notify
    // recommend, // auth , in customer table , accpted , add a notification entry
    // activateWater // auth , in customer table , plant.direct cc control=1
}