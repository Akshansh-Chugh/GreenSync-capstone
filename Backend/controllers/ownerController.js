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
import redis from "../config/redis.js";


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
    const {email,phone,password}=req.body
    if((!email && !phone)||!password)
        throw new apiError(400,"Creds missing")

    const exsistingUser= await owner.findById( req.user._id) // why not get from req.user? ->> bcs req.user does not contain password
    let valid = await exsistingUser.isPwdCorrect(password) 
    if(!valid)
        throw new apiError(403,"Incorrect creds")

    const myFeilds=exsistingUser.myPlants()

    // plants exclusive to this owner
    const plants = await coOwner.find({owner:exsistingUser._id},{plant:1,_id:0})

    const result = []

        // generally avoid loops as , a simple o(n) can become really expensive with million plants
        // but here complexity will be o(plants * log(n))
        // assuming deleteowner will be rarely used and say a owner has 20 plants out of a million entries
        // loop runs 20*log(1000000)= 400 times
        // if it was common operation, we would maintain totalOwners feild in plant 

    for (const { plant } of plants) {
        const ownerCount = await coOwner.countDocuments({ plant }) 

        if (ownerCount === 1) 
            result.push(plant)
    }

    if(result.length>0)
        throw new apiError(407,`Delete failed\nConsider deleting these ${result}`)

    const old= await owner.findByIdAndDelete(exsistingUser._id).select( "-_id -password -refreshToken ") // del from other tables is handeled in pre method in owner model

    if(!old)
        throw new apiError(501,"Delete failed from serverside")

    if(exsistingUser.profile_pic.toString() !== "https://res.cloudinary.com/chugh/image/upload/hzlskdlloutmzgg6ihfh.jpg") // not default
        await cloud_del(exsistingUser.profile_pic)

    res.status(200)
    .clearCookie("refreshToken",cookieSettings)
    .clearCookie("accessToken",cookieSettings)
    .clearCookie("PlantRefresh",cookieSettings)
    .json(new apiResponse(200,`Deleted ${old}`))
    redis.del(`owner:${exsistingUser._id}`)
})

const myPlants=asyncHandler (async(req,res)=>
{
    const exsisting= req.user

    if (!exsisting)
        throw new apiError(400,"Please Login first")

    const Plants = await exsisting.myPlants()
    
    if(!Plants.length)
        throw new apiError(200,"Register your First plant😊")

    res.status(200)
    .json(new apiResponse(200,Plants,`Sucesfully fetched your ${exsisting.totalFeilds} plants`))

})

const addCoOwner = asyncHandler (async (req,res)=>
{
    const exsistingUser= req.user
    let plants= await exsistingUser.myPlants()
    
    const {email, phone, pId}=req.body
    
    if((!email && !phone)|| !pId)
        throw new apiError(400,"Incomplete creds")

    const newOwner =await owner.findOne({$or:[{email},{phone}]})

    if(!newOwner)
        throw new apiError(404, "User not found")

    const Plant= await plant.findById(pId)

    if(!Plant)
        throw new apiError(404, "Plant not found")

    let valid=false

    for(const {plant} of plants)
        if(plant._id.toString() === pId)
        {
            valid=true
            break
        }

    if(!valid)
        throw new apiError(402,"You may only share plants that you own")

    const exsistingCoOwner= await coOwner.exists({owner:newOwner._id ,plant:pId})

    if(exsistingCoOwner)
        throw new apiError(401, `${newOwner.name} is already a co-Owner of this plant`)

    const newco = await coOwner.create({owner:newOwner._id , plant:pId })
    
    if(!newco)
        throw new apiError(500,"something went wrong")

    res.status(200)
    .json(new apiResponse(200,{},"Added new co-owner sucessfully"))

    redis.del(`owner:${newco._id}`)

})

const removeCaretaker =asyncHandler(async(req,res)=>
{
    const{Plant,Caretaker}=req.body
    const Owner= req.user

    if(!Plant || !Caretaker)
        throw new apiError(400,"Plant and Caretaker needed")

    const Plants =await Owner.myPlants()
    const careTaker= await caretaker.findOne({$or:[{email:Caretaker},{phone:Caretaker}]})

    if(!careTaker)
        throw new apiError(404,"Caretaker not found")

    const ownsPlant = Plants.some(({plant})=> String(plant._id) === String(Plant))

    if(!ownsPlant)
        throw new apiError(402, "Cannot delete plants that do not belong to you")

    //no need to check cr exsists ! as del operation will return empty if no doc found

    // no need to use await 
    await customer.deleteOne({plant:Plant, caretaker:careTaker._id})
    await plant.findByIdAndUpdate(Plant,{directCaretakerControl:false})

    res.status(200)
    .json(new apiResponse(200,"","Deletion sucessfull"))

})

const leavePlant = asyncHandler(async(req,res)=>
{
    const {Plant}= req.body

    const ownerCount= await coOwner.countDocuments({plant:Plant})
    if(ownerCount==1)
        throw new apiError(402,"Delete or handover this plant first")

    // no need to check if this user owns the plant 
    const deleted = await coOwner.deleteOne({plant:Plant,owner:req.user._id})

    if(!deleted)
        throw new apiError(402,"You may not be owner of this plant")
    
    res.status(200)
    .clearCookie("PlantRefresh",cookieSettings)
    .json(new apiResponse(200,{},"sucess"))
    redis.del(`owner:${req.user._id}`)
})

export {registerUser,
    loginUser,                // input(email pwd), verify user exsist, correct pwd , tokens, send cokki , success
    updateDetails,            // auth , input, not email , not pwd , not profile, not phone, change in db ,verify, success
    deleteOwner,              // auth , verify pwd , not only owner ,remove from (customer, owner , co owner , notification) table,delete profilePic, remove cookie, success, del redis key
    logout,                   // auth, del cookie , del refresh token ,success
    changePwd,                // verify pwd , db.save, success
    changeProfilePic,         // auth , new pic , upload , remove old from (cloud,local), db.save, success 
    addCaretaker,             // auth , my plants , input, cr exsists, update plant.direct , new customer entry, success
    removeCaretaker,          // auth , my plants, del customer entry , success 
    getAccess,
    myPlants,                 // auth , owner.myPlants(),sucess, add to redis(added my owner.myPlants())
    addCoOwner,               // auth , my plants , verify inputs, user exsists?, plant exsists?,not exsisting co-owner?, add to coOwner, sucess, del new co-owner from redis
    leavePlant                // auth , not only owner, del co-owner enrty, sucess, del redis owner
}
// fix deleteowner-> model -> notification