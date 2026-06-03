import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {owner} from "../models/owner.js";
import { to_cloud ,cloud_del} from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";


const cookieSettings=
{
    httpOnly:true,
    secure :true
}

const registerUser=asyncHandler(async(req,res)=>
{
    let {name,email,phone,password,age,adhaar,totalFeilds, profile_pic}=req.body;
    if (!name || !email || !phone || !password) throw new apiError(400, "All fields are required")
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
    if (!valid) throw new apiError(403,"Invalid credentials")

    const accessToken=await currentUser.generateAccessToken()
    const refreshToken=await currentUser.generateRefreshToken()

    res.cookie("accessToken",accessToken,cookieSettings)
    .cookie("refreshToken",refreshToken,cookieSettings)
    .json( new apiResponse(200,currentUser))
})

const updateDetails=asyncHandler(async(req,res)=>
{
    //inputs
    const {
    name = req.user?.name,
    email = req.user?.email,
    phone = req.user?.phone,
    age = req.user?.age,
    adhaar = req.user?.adhaar
    } = req.body
    //update
    const updatedUser = await owner.findByIdAndUpdate(
        req.user._id,
        {name,email,phone,age,adhaar},
        { returnDocument: "after",runValidators: true}
    )

    //respond
    if(updatedUser) res.status(200).json(new apiResponse(200,`Updated data to ${updatedUser}`))
    else throw new apiError(500, `${req.user}`)
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
    const user= await owner.findById(decoded._id)
    if (!user) 
        throw new apiError(404,"User not found")
    
    if (!await user.isPwdCorrect(oldPwd)) 
        throw new apiError(402,"Incorrect Password")
    user.password=newPwd
    await user.save()
    res.status(200).json(new apiResponse(200,"Password saved Successfully"))
})

const changeProfilePic = asyncHandler(async (req, res) => {

    const newPic = req.files?.profile_pic?.[0]?.path
    console.log(req.files)

    if (!newPic) 
        throw new apiError(400, "Please provide a profile picture")
    
    const user = await owner.findById(req.user._id)

    if (!user) 
        throw new apiError(404, "User not found")
    

    const oldPic = user.profile_pic

    const uploadedUrl = await to_cloud(newPic)

    if (!uploadedUrl) {
        throw new apiError(
            500,
            "Something went wrong while uploading profile picture"
        )
    }

    // Update DB first
    user.profile_pic = uploadedUrl
    await user.save()

    // Delete 
    if (oldPic) {
        try {await cloud_del(oldPic)}
        catch (err) {
            console.error("Failed to delete old profile picture:",err)
            throw new apiError(500,err)}}

    return res.status(200).json(
        new apiResponse(200,{profile_pic: user.profile_pic},
            `sucess: true`
        )
    );
});

const logout= asyncHandler(async(req,res)=>
{
    const user=req.user
    await owner.findByIdAndUpdate(user._id,{refreshToken:""})
    res
    .status(200)
    .clearCookie("refreshToken",cookieSettings)
    .clearCookie("accessToken",cookieSettings)
    .json({message:"Sucess"})
})

const deleteOwner= asyncHandler(async(req,res)=>
{

})

export {registerUser,
    loginUser,                // input(email pwd), verify user exsist, correct pwd , tokens, send cokki , success
    updateDetails,            // auth , input, not email , not pwd , not profile, not phone, change in db ,verify, success
    // deleteOwner,           // auth , verify pwd , not only owner ,remove from customer table, del (owner , co owner , notification) table, remove cookie , success
    logout,                   // auth, del cookie , del refresh token ,success
    changePwd,                // verify pwd , db.save, success
    changeProfilePic,         // auth , new pic , upload , remove old from (cloud,local), db.save, success 
    // addCaretaker,          // auth , my plants , input, cr exsists, notify cr, update plant.direct , new customer entry, success
    // removeCaretaker        // auth , my plants, cr accepted, del customer entry , notify cr , success 
}