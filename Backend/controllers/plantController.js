import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import {plant} from "../models/plant.js"

const createPlant=asyncHandler( async (req,res)=>
{
    let {type,name,season,water,location,area,directCaretakerControl}=req.body
    // if (!type || !name || !season || !water || !location || !area || !directCaretakerControl) throw new apiError(400,"All fields are required")

    const newPlant=await plant.create({type,name,season,water,location,area,directCaretakerControl})

    const createdPlant= await plant.findByIdAndUpdate(newPlant._id)
    if (!createdPlant) throw new apiError(500,"Plant creation failed")

    res.json(new apiResponse(200,createdPlant))
})

export default createPlant;