import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {caretaker} from "../models/caretaker.js"
import { to_cloud ,cloud_del} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";
import Check_required_fields from "../checks/ownerCheck.js"

    const cookieSettings=
{
    httpOnly:true,
    secure :true
}
const create = asyncHandler(async (req,res)=>
{

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

const updateCaretaker = asyncHandler(async(req,res)=>
{
    const {name, email, phone, age, adhaar, qualification}= req.body
    const updatedUser = await caretaker.findByIdAndUpdate(req.user._id,{name,email,phone,age,adhaar, qualification},
            { returnDocument: "after",runValidators: true})
    
    if(updatedUser) 
            res.status(200).json(new apiResponse(200,{updatedUser}))
    else throw new apiError(500, `${req.user}`)
})

const login=asyncHandler(async(req,res)=>
{
    let {email,password,phone}=req.body
    if ((!phone && !email )|| !password) throw new apiError(400,"All fields are required")
    const currentUser= await caretaker.findOne({$or:[{email},{phone}]}).select("-__v -refreshtoken -createdAt")
    if (!currentUser) throw new apiError(401,"User not found")
    const valid = await currentUser.isPwdCorrect(password);
    if (!valid) throw new apiError(403,"Invalid credentials")
    
    const accessToken=await currentUser.generateAccessToken()
    const refreshToken=await currentUser.generateRefreshToken()

    res.cookie("accessToken",accessToken,cookieSettings)
    .cookie("refreshToken",refreshToken,cookieSettings)
    .json( new apiResponse(200, {name:currentUser.name,email:currentUser.email,phone:currentUser.phone,profile_pic:currentUser.profile_pic}))
})

const logout= asyncHandler(async(req,res)=>
{
    const user=req.user
    await caretaker.findByIdAndUpdate(user._id,{refreshToken:""})
    res
    .status(200)
    .clearCookie("refreshToken",cookieSettings)
    .clearCookie("accessToken",cookieSettings)
    .json(new apiResponse(200,"logged out","success"))
})

const changePwd= asyncHandler(async (req,res)=>
{
    const {oldPwd, newPwd}= req.body
    if(!oldPwd || !newPwd) throw new apiError(400, "Need both old and new Password")

    const cookie= req.cookies.accessToken
    if (!cookie) 
        throw new apiError(404,"Cookie not found")
    const decoded= jwt.verify(cookie,process.env.ACCESS_PWD)
    if(!decoded) 
        throw new apiError(402,"Invalid Token")
    const user= await caretaker.findById(decoded._id)
    if (!user) 
        throw new apiError(404,"User not found")
    
    if (!await user.isPwdCorrect(oldPwd)) 
        throw new apiError(402,"Incorrect Password")
    user.password=newPwd
    await user.save()
    res.status(200).json(new apiResponse(200,"Password saved Successfully"))
})

const changeProfile = asyncHandler(async (req, res) => {

    const newPic = req.files?.profile_pic?.[0]?.path

    if (!newPic) 
        throw new apiError(400, "Please provide a profile picture")
    
    const user = await caretaker.findById(req.user._id)

    if (!user) 
        throw new apiError(404, "User not found")
    
    const oldPic = user.profile_pic

    const uploadedUrl = await to_cloud(newPic)

    if (!uploadedUrl) {
        throw new apiError(500,"Something went wrong while uploading profile picture")}

    // Update DB first
    user.profile_pic = uploadedUrl
    await user.save()

    // Delete 
    if (oldPic) {
        try {await cloud_del(oldPic)}
        catch (err) {
            console.error("Failed to delete old profile picture:",err)
            throw new apiError(500,err)}}

    return res.status(200)
    .json(new apiResponse(200,{profile_pic: user.profile_pic},`sucess: true`))})

export {
    create,               // same are owner
    // deleteCaretaker,      // auth , verify pwd, notify customer, del caretaker table , del customer table
    updateCaretaker,      // same as owner
    login,                // same
    logout,               // same
    changePwd,            // same
    changeProfile,        // same
    // leavePlant,           // auth , plant in customer and accept=1 , notify , del customer
    // acceptReq,            // auth , plant in customer & accept, notify
    // recommend,            // auth , in customer table , accpted , add a notification entry
    // activateWater         // auth , in customer table , plant.direct cc control=1
}