import { asyncHandler } from "../utils/asyncHandler.js";
import {apiResponse} from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {owner} from "../models/owner.js";
import { to_cloud ,cloud_del} from "../utils/cloudinary.js"
import jwt, { decode } from "jsonwebtoken";
import { caretaker } from "../models/caretaker.js";
import { plant } from "../models/plant.js";
import {customer} from "../models/customer.js"
import { coOwner } from "../models/coOwner.js";


const cookieSettings=
{
    httpOnly:true,
    secure :true
}

const registerUser=asyncHandler(async(req,res)=>
{
    let {name,email,phone,password,age,adhaar,totalFeilds, profile_pic}=req.body;
    if (!name || !email || !phone || !password) throw new apiError(400, "All fields are required")

    const exsistingUser=await owner.findOne({
        $or:[{email},{phone}]
    })

    if (exsistingUser) throw new apiError(401,"User already exists")
    if (req.files?.profile_pic?.[0]?.path)
    {
        let local_path=req.files.profile_pic[0].path
        profile_pic=await to_cloud(local_path)
    }
    
    let newUser=await owner.create({name,email,phone,password,age,adhaar,totalFeilds, profile_pic})

    const accessToken=newUser.generateAccessToken()
    const refreshToken= await newUser.generateRefreshToken()
    const createdUser= await owner.findByIdAndUpdate(newUser._id,                     // only updates db (local variable is untouched)
        {refreshToken: refreshToken},
        {returnDocument:'after'}                                                          // new is to update local variable too
    ).select("-password -refreshToken -__v")

    if (!createdUser) throw new apiError(500,"User creation failed")

    if (password === "pwd" || !accessToken ||!refreshToken)  
        {
            await owner.deleteOne({ _id: newUser._id });
        }
    

    return res.status(200)
    .cookie("accessToken",accessToken,cookieSettings)
    .cookie("refreshToken",refreshToken,cookieSettings)
    .json(new apiResponse(200,"User created Successfully"))

})

const loginUser=asyncHandler(async(req,res)=>
{
    let {email,password, phone}=req.body
    if ((!phone && !email )|| !password) throw new apiError(400,"All fields are required")
    const currentUser= await owner.findOne({$or:[{email},{phone}]}).select("-__v -refreshtoken -createdAt")
    if (!currentUser) throw new apiError(401,"User not found")
    const valid = await currentUser.isPwdCorrect(password);
    if (!valid) throw new apiError(403,"Invalid credentials")
    
    const accessToken=await currentUser.generateAccessToken()
    const refreshToken=await currentUser.generateRefreshToken()

    res.cookie("accessToken",accessToken,cookieSettings)
    .cookie("refreshToken",refreshToken,cookieSettings)
    .json( new apiResponse(200, {name:currentUser.name,email:currentUser.email,phone:currentUser.phone,profile_pic:currentUser.profile_pic}))
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
    if(updatedUser) 
        res.status(200)
        .json(new apiResponse(200,{"name":updatedUser.name, "email":updatedUser.email, "phone":updatedUser.phone, "age":updatedUser.age,"adhaar":updatedUser.adhaar}))
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

const getAccess=asyncHandler(async(req,res)=>
{
    const cookie = req.cookies?.refreshToken
    if(!cookie) throw new apiError(405,"No refresh token")
    let decoded
    try {decoded = jwt.verify(cookie, process.env.REFRESH_PWD);}
    catch (err) {throw new apiError(406, err,err);}
    const user= await owner.findById(decoded?._id)
    if(cookie == user.refreshToken) 
        res.status(200)
            .cookie("accessToken",await user.generateAccessToken(),cookieSettings)
            .json(new apiResponse(200,"Sucess"))
})

// const addCaretaker= async function (emailOrPhone,plantid) {

//     // myplant?
//     // validate inputs
//     // caretaker exsists?
//     // add to customer table
//     // verify customer entry
//     // success

//     if(!emailOrPhone) throw new apiError(402,"Please enter an email/Phone no. of a registered caretaker")

//     const exsists =await caretaker.findOne({$or:[{email:emailOrPhone},{phone:emailOrPhone}]})

//     if(!exsists)
//         throw new apiError(402,"No caretaker found")


// }

const addCaretaker = asyncHandler(async (req,res)=>
{
    const curr = req.user
    req.plants=await curr.myPlants()
    const{plantId, Caretaker,directCaretakerControl=false}= req.body
    if(!plantId || !Caretaker)
        throw new apiError(400,"Select a plant and caretaker")

    const ownedPlant = req.plants.find(p => p.plant._id.toString() == plantId);

    if (!ownedPlant)
        throw new apiError(403, "Only an existing co-owner can add a caretaker.");

    const C= await caretaker.findOne({$or:[{email:Caretaker},{phone:Caretaker}]})

    if(!C)
        throw new apiError(402,"This caretaker doesnot exsists")

    if (ownedPlant.directCaretakerControl !==directCaretakerControl )
        await plant.findByIdAndUpdate(plantId,{directCaretakerControl})

    try
    {
        await customer.create({caretaker:C._id,plant:plantId})
    }
    catch(err)
    {
        if(err.code===11000)
            throw new apiError(401, "Already exists");
        throw err;
    }
    return res.status(200).
    json(new apiResponse(200,{}, "Request sent sucessfully, waiting for caretaker to accept"))
})

const deleteOwner= asyncHandler(async(req,res)=>
{
    const {email,phone,password, removeAllPlants}=req.body
    if((!email && !phone)||!password)
        throw new apiError(400,"Creds missing")

    const exsistingUser= req.user

    if(!exsistingUser.isPwdCorrect(password))
        throw new apiError(403,"Incorrect password")

    const myFeilds=exsistingUser.myPlants()

    // plants exclusive to this owner


    const exclusivePlants= await coOwner.aggregate([
        {
            $match:
            {
                plant: {$in: myFeilds}
            }
        },
        {
            $group:
            {

            }
        }
])

})

const myPlants=asyncHandler (async(req,res)=>
{
    const exsisting= req.user

    if (!exsisting)
        throw new apiError(400,"Please Login first")

    const Plants = await exsisting.myPlants()
    
    if(!Plants)
        throw new apiError(200,"Register your First plant😊")

    res.status(200)
    .json(new apiResponse(200,Plants,`Sucesfully fetched your ${exsisting.totalFeilds} plants`))

})

export {registerUser,
    loginUser,                // input(email pwd), verify user exsist, correct pwd , tokens, send cokki , success
    updateDetails,            // auth , input, not email , not pwd , not profile, not phone, change in db ,verify, success
    // deleteOwner,           // auth , verify pwd , not only owner ,remove from customer table, del (owner , co owner , notification) table, remove cookie , success
    logout,                   // auth, del cookie , del refresh token ,success
    changePwd,                // verify pwd , db.save, success
    changeProfilePic,         // auth , new pic , upload , remove old from (cloud,local), db.save, success 
    addCaretaker,             // auth , my plants , input, cr exsists, update plant.direct , new customer entry, success
    // removeCaretaker        // auth , my plants, cr accepted, del customer entry , success 
    getAccess,
    // getNotification        // auth, , my plants , send where {to=plant} in my plants (from notification table), add to res , sucess
    myPlants                  // auth, owner.myPlants(),sucess 
}