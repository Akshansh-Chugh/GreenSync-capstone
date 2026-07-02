import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {plant} from "../models/plant.js"
import {owner} from "../models/owner.js"
import {coOwner} from "../models/coOwner.js"
import { to_cloud } from "../utils/cloudinary.js";

const cookieSettings=
{
    httpOnly:true,
    secure :true
}

const registerESP= asyncHandler (async (req,res)=>

{
    const {email,phone,password,espMac}= req.body
    
    if((!email && !phone)|| !password || !espMac)
        throw new apiError(400, "Enter all credentials")

    const user=await owner.find({
        $or:[{email},{phone}]
    })

    if(!user) throw new apiError(402,"User not found")
    
    if (! await owner.isPwdCorrect(password))
        throw new apiError(402,"Username or Password is incorrect")
    

     

    res.status(200)
    .cookie("accessToken",)
})


const createPlant = asyncHandler(async (req, res) => {
    //first login from esp as a normal user to get acessToken
    let {type, name, season, water, location, area, directCaretakerControl,espMac,plant_pic} = req.body;
    const Owner=req.user?._id
    

    // 1. Validation
    if ([Owner, type, name, season, water, location, area, directCaretakerControl,espMac].some(field => !field)) {
        throw new apiError(400, "All fields are required");
    }

    // 2. Use findOne to get the actual object, not an array
    const ownerDoc = await owner.findOne({ _id: Owner });

    if (!ownerDoc) {
        throw new apiError(404, "Owner not found");
    }
    plant_pic=req.files?.plant_pic?.[0].path
    if (plant_pic)
    {
        let local_path=plant_pic        
        plant_pic=await to_cloud(plant_pic)
    }

    // 3. Generate the Custom ID
    // Using ownerDoc.totalFeilds (matches your typo in the schema)
    const customPlantId = `${Owner}${(ownerDoc.totalFeilds || 0) + 1}`;

    // 4. Create the Plant
    let newPlant = await plant.create({
        plant_pic,
        type,
        name,
        season,
        water,
        location,
        area,
        directCaretakerControl,
        espMac  // stores plant number as well {espMac}{Plant number(1-5)}
    }
    // {returnDocument:'after'}
);


let newCoOwner = await coOwner.create(
    {
        owner:Owner,
        plant:newPlant._id
    },
)
    newPlant= await plant.findById(newPlant._id).select(" -espMac -__v -updatedAt -createdAt")
    newCoOwner = await coOwner.findById(newCoOwner._id).select("-_id -createdAt -updatedAt -__v")
    if(!newPlant || !newCoOwner) throw new apiError(500, "Something went Wront")

    // update total feild for owner
    await owner.findByIdAndUpdate(ownerDoc._id, {
        $inc: { totalFeilds: 1 }
    });

    const PlantRefresh= await newPlant.generateRedreshToken()
    if(!PlantRefresh) throw new apiError(500,"Failed to create a cookie")

    return res.status(200)
    .cookie("PlantRefresh",PlantRefresh,cookieSettings)
    .json(new apiResponse(200, {newPlant, newCoOwner}, "Plant created successfully"));
});

export default createPlant;
export {
    registerESP,
    createPlant,  //auth(owner) ,input , validate , add to plant table ,inc owner.noOfPlants, add to co owner table
    // deletePlant,  // auth(owner), verify pwd , my plants , del (plant , customer , co owner , fertiliser , reading) ,decrement owner.noOfPlants,notify (cr , co owner)
    // activateWater,//auth , my plants or (customer and direct cc) , try on esp (do not send success as esp might take hours to water)
    // water_eq    // cors , success
}